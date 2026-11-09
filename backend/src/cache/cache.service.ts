import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import Redis from 'ioredis';

const DEFAULT_TTL_SECONDS = 60;
const MAX_TTL_SECONDS = 24 * 60 * 60;

function positiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

@Injectable()
export class CacheService {
  private readonly prefix = process.env.CACHE_PREFIX?.trim() || 'spotify:cache';
  private readonly defaultTtl = Math.min(
    positiveInteger(process.env.CACHE_TTL_SECONDS, DEFAULT_TTL_SECONDS),
    MAX_TTL_SECONDS,
  );
  private readonly pending = new Map<string, Promise<unknown>>();

  constructor(@InjectRedis() private readonly redis: Redis) {}

  private cacheKey(namespace: string, key: string) {
    const digest = createHash('sha256').update(key).digest('hex');
    return `${this.prefix}:${namespace}:${digest}`;
  }

  async get<T>(namespace: string, key: string): Promise<T | undefined> {
    const value = await this.redis.get(this.cacheKey(namespace, key));
    if (value === null) return undefined;

    try {
      return JSON.parse(value) as T;
    } catch {
      await this.redis.del(this.cacheKey(namespace, key));
      return undefined;
    }
  }

  async set<T>(
    namespace: string,
    key: string,
    value: T,
    ttlSeconds = this.defaultTtl,
  ) {
    const ttl = Math.min(
      positiveInteger(String(ttlSeconds), this.defaultTtl),
      MAX_TTL_SECONDS,
    );
    await this.redis.set(
      this.cacheKey(namespace, key),
      JSON.stringify(value),
      'EX',
      ttl,
    );
    return value;
  }

  async remember<T>(
    namespace: string,
    key: string,
    factory: () => Promise<T>,
    ttlSeconds = this.defaultTtl,
  ): Promise<T> {
    const scopedKey = this.cacheKey(namespace, key);

    try {
      const cached = await this.get<T>(namespace, key);
      if (cached !== undefined) return cached;
    } catch {
      return factory();
    }

    const existing = this.pending.get(scopedKey) as Promise<T> | undefined;
    if (existing) return existing;

    const pending = factory().then(async (value) => {
      try {
        await this.set(namespace, key, value, ttlSeconds);
      } catch {
        // Cache failures must not turn a successful database read into an error.
      }
      return value;
    });

    this.pending.set(scopedKey, pending);
    try {
      return await pending;
    } finally {
      this.pending.delete(scopedKey);
    }
  }
}
