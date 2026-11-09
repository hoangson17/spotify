import { CacheService } from './cache.service';
import Redis from 'ioredis';

type RedisMock = {
  get: jest.Mock<(key: string) => Promise<string | null>>;
  set: jest.Mock<
    (key: string, value: string, mode: 'EX', ttl: number) => Promise<'OK'>
  >;
  del: jest.Mock<(key: string) => Promise<number>>;
};

describe('CacheService', () => {
  let redis: RedisMock;
  let cache: CacheService;

  beforeEach(() => {
    redis = {
      get: jest.fn(() => Promise.resolve(null)),
      set: jest.fn(() => Promise.resolve('OK' as const)),
      del: jest.fn(() => Promise.resolve(1)),
    };
    cache = new CacheService(redis as unknown as Redis);
  });

  it('returns a cached value without calling the factory', async () => {
    redis.get.mockResolvedValue(JSON.stringify({ tracks: [1] }));
    const factory = jest.fn();

    await expect(cache.remember('search', 'hello', factory)).resolves.toEqual({
      tracks: [1],
    });
    expect(factory).not.toHaveBeenCalled();
  });

  it('stores a cache miss with the configured TTL', async () => {
    const factory = jest.fn().mockResolvedValue({ tracks: [] });

    await expect(
      cache.remember('search', 'hello', factory, 30),
    ).resolves.toEqual({ tracks: [] });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringMatching(/^spotify:cache:search:[a-f0-9]{64}$/),
      JSON.stringify({ tracks: [] }),
      'EX',
      30,
    );
  });

  it('falls back to the factory when Redis is unavailable', async () => {
    redis.get.mockRejectedValue(new Error('Redis unavailable'));

    await expect(
      cache.remember('search', 'hello', () => Promise.resolve({ tracks: [] })),
    ).resolves.toEqual({ tracks: [] });
  });

  it('coalesces concurrent reads for the same key', async () => {
    let resolveFactory: (value: string) => void = () => undefined;
    const deferred = new Promise<string>((resolve) => {
      resolveFactory = resolve;
    });
    const factory = jest.fn(() => deferred);

    const first = cache.remember('search', 'hello', factory);
    const second = cache.remember('search', 'hello', factory);
    resolveFactory('result');

    await expect(Promise.all([first, second])).resolves.toEqual([
      'result',
      'result',
    ]);
    expect(factory).toHaveBeenCalledTimes(1);
  });
});
