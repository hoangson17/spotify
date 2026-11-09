const MB = 1024 * 1024;

function limit(name: string, fallback: number, ceiling: number) {
  const value = process.env[name] ? Number(process.env[name]) : fallback;
  if (!Number.isSafeInteger(value) || value < 1 || value > ceiling) {
    throw new Error(`${name} must be an integer between 1 and ${ceiling} MB`);
  }
  return value * MB;
}

export function getUploadLimits() {
  return {
    imageMaxBytes: limit('UPLOAD_MAX_IMAGE_MB', 10, 100),
    audioMaxBytes: limit('UPLOAD_MAX_AUDIO_MB', 100, 1024),
  };
}

export function uploadLimitMessage() {
  const limits = getUploadLimits();
  return `Tệp vượt quá dung lượng cho phép. Ảnh tối đa ${limits.imageMaxBytes / MB} MB, MP3 tối đa ${limits.audioMaxBytes / MB} MB.`;
}
