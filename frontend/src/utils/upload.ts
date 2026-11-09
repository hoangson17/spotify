import axios from "axios";

export type UploadLimits = { imageMaxBytes: number; audioMaxBytes: number };
export const DEFAULT_UPLOAD_LIMITS: UploadLimits = {
  imageMaxBytes: 10 * 1024 * 1024,
  audioMaxBytes: 100 * 1024 * 1024,
};
let cached: Promise<UploadLimits> | null = null;

export function loadUploadLimits(): Promise<UploadLimits> {
  if (!cached) {
    cached = axios
      .get(
        `${String(import.meta.env.VITE_SERVER_API).replace(/\/$/, "")}/upload-limits`,
        { timeout: 5000 }
      )
      .then(({ data }) => {
        if (
          !Number.isSafeInteger(data?.imageMaxBytes) ||
          !Number.isSafeInteger(data?.audioMaxBytes) ||
          data.imageMaxBytes <= 0 ||
          data.audioMaxBytes <= 0
        )
          throw new Error("Invalid upload limits");
        return data as UploadLimits;
      })
      .catch(() => {
        cached = null;
        return DEFAULT_UPLOAD_LIMITS;
      });
  }
  return cached;
}

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export function validateUploadFile(
  file: { name: string; size: number },
  kind: "image" | "audio",
  limits: UploadLimits
) {
  const maximum =
    kind === "audio" ? limits.audioMaxBytes : limits.imageMaxBytes;
  if (file.size > maximum)
    throw new UploadValidationError(
      `${kind === "audio" ? "MP3" : "Ảnh"} "${file.name.slice(0, 80)}" vượt quá ${maximum / (1024 * 1024)} MB.`
    );
}

export function uploadErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof UploadValidationError) return error.message;
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message !== "File too large")
      return message;
    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === "string")
    )
      return message.join(". ");
    if (error.response?.status === 413)
      return "Máy chủ từ chối dung lượng upload (413). Hãy chọn tệp nhỏ hơn.";
  }
  return fallback;
}
