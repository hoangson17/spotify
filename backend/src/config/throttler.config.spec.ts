import { getThrottlerConfig } from './throttler.config';

describe('Throttler configuration', () => {
  const previousLimit = process.env.THROTTLE_LIMIT;
  const previousTtl = process.env.THROTTLE_TTL_SECONDS;

  afterEach(() => {
    if (previousLimit === undefined) delete process.env.THROTTLE_LIMIT;
    else process.env.THROTTLE_LIMIT = previousLimit;
    if (previousTtl === undefined) delete process.env.THROTTLE_TTL_SECONDS;
    else process.env.THROTTLE_TTL_SECONDS = previousTtl;
  });

  it('uses safe defaults', () => {
    delete process.env.THROTTLE_LIMIT;
    delete process.env.THROTTLE_TTL_SECONDS;

    expect(getThrottlerConfig().throttlers).toEqual([
      { name: 'default', limit: 100, ttl: 60_000 },
    ]);
  });

  it('reads valid environment overrides', () => {
    process.env.THROTTLE_LIMIT = '25';
    process.env.THROTTLE_TTL_SECONDS = '30';

    expect(getThrottlerConfig().throttlers[0]).toEqual({
      name: 'default',
      limit: 25,
      ttl: 30_000,
    });
  });

  it('rejects unsafe environment values', () => {
    process.env.THROTTLE_LIMIT = '0';
    expect(() => getThrottlerConfig()).toThrow('THROTTLE_LIMIT');

    process.env.THROTTLE_LIMIT = '100';
    process.env.THROTTLE_TTL_SECONDS = 'not-a-number';
    expect(() => getThrottlerConfig()).toThrow('THROTTLE_TTL_SECONDS');
  });
});
