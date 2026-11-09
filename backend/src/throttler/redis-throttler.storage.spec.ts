import Redis from 'ioredis';
import { RedisThrottlerStorage } from './redis-throttler.storage';

describe('RedisThrottlerStorage', () => {
  let redis: { eval: jest.Mock };

  beforeEach(() => {
    redis = { eval: jest.fn() };
  });

  it('maps the atomic Redis result to the throttler record', async () => {
    redis.eval.mockResolvedValue([3, 60, 1, 120]);
    const storage = new RedisThrottlerStorage(redis as unknown as Redis);

    await expect(
      storage.increment('client-key', 60_000, 2, 120_000, 'default'),
    ).resolves.toEqual({
      totalHits: 3,
      timeToExpire: 60,
      isBlocked: true,
      timeToBlockExpire: 120,
    });

    expect(redis.eval).toHaveBeenCalledWith(
      expect.stringContaining("redis.call('TIME')"),
      3,
      expect.stringMatching(/^spotify:throttle:\{[a-f0-9]{64}\}:hits$/),
      expect.stringMatching(/^spotify:throttle:\{[a-f0-9]{64}\}:block$/),
      expect.stringMatching(/^spotify:throttle:\{[a-f0-9]{64}\}:sequence$/),
      60_000,
      2,
      120_000,
    );
  });

  it('reports requests below the limit as allowed', async () => {
    redis.eval.mockResolvedValue([1, 60, 0, 0]);
    const storage = new RedisThrottlerStorage(redis as unknown as Redis);

    await expect(
      storage.increment('client-key', 60_000, 100, 60_000, 'default'),
    ).resolves.toMatchObject({ totalHits: 1, isBlocked: false });
  });

  it('fails closed when Redis returns an invalid result', async () => {
    redis.eval.mockResolvedValue(null);
    const storage = new RedisThrottlerStorage(redis as unknown as Redis);

    await expect(
      storage.increment('client-key', 60_000, 100, 60_000, 'default'),
    ).rejects.toThrow('invalid throttler result');
  });
});
