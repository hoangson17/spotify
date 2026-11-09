import { useEffect, useState } from "react";
import { DEFAULT_UPLOAD_LIMITS, loadUploadLimits } from "@/utils/upload";

export function UploadLimitHint({ kind }: { kind: "image" | "audio" }) {
  const [limits, setLimits] = useState(DEFAULT_UPLOAD_LIMITS);
  useEffect(() => {
    let active = true;
    loadUploadLimits().then((value) => {
      if (active) setLimits(value);
    });
    return () => {
      active = false;
    };
  }, []);
  const size =
    (kind === "audio" ? limits.audioMaxBytes : limits.imageMaxBytes) /
    (1024 * 1024);
  return (
    <p className="mt-1 text-xs text-muted-foreground">
      {kind === "audio" ? "MP3" : "JPG, PNG, WebP, GIF"} · Tối đa {size} MB
    </p>
  );
}
