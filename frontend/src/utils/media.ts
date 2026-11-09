const apiBase = String(import.meta.env.VITE_SERVER_API ?? '').replace(/\/+$/, '');

export function mediaUrl(
  source: string | null | undefined,
  fallback = '',
): string {
  const value = source?.trim();
  if (!value) return fallback;

  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  const normalized = value.replace(/\\/g, '/');
  if (/^\/?uploads\//i.test(normalized)) {
    const path = `/${normalized.replace(/^\/+/, '')}`;
    return apiBase ? `${apiBase}${path}` : path;
  }

  // Vite assets and public files belong to the frontend origin.
  return normalized;
}

export function useFallbackImage(
  event: { currentTarget: HTMLImageElement },
  fallback: string,
) {
  if (event.currentTarget.src !== fallback) event.currentTarget.src = fallback;
}
