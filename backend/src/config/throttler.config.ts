const DEFAULT_LIMIT = 100;
const DEFAULT_TTL_SECONDS = 60;

function positiveInteger(
  name: string,
  fallback: number,
  maximum: number,
): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') return fallback;

  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > maximum) {
    throw new Error(`${name} must be an integer between 1 and ${maximum}`);
  }
  return value;
}

export function getThrottlerConfig() {
  return {
    throttlers: [
      {
        name: 'default',
        limit: positiveInteger('THROTTLE_LIMIT', DEFAULT_LIMIT, 10_000),
        ttl:
          positiveInteger('THROTTLE_TTL_SECONDS', DEFAULT_TTL_SECONDS, 3_600) *
          1_000,
      },
    ],
    errorMessage: 'Too many requests. Please try again later.',
  };
}
