import { createHash } from 'crypto';
import type { ThrottlerStorage } from '@nestjs/throttler';
import type Redis from 'ioredis';

type StorageRecord = {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
};

const INCREMENT_SCRIPT = `
local redisTime = redis.call('TIME')
local now = (tonumber(redisTime[1]) * 1000) + math.floor(tonumber(redisTime[2]) / 1000)
local ttl = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local blockDuration = tonumber(ARGV[3])

local blockTtl = redis.call('PTTL', KEYS[2])
if blockTtl > 0 then
  local hits = tonumber(redis.call('ZCARD', KEYS[1]))
  return {math.max(hits, limit + 1), math.ceil(blockTtl / 1000), 1, math.ceil(blockTtl / 1000)}
end

redis.call('ZREMRANGEBYSCORE', KEYS[1], '-inf', now - ttl)
local hits = tonumber(redis.call('ZCARD', KEYS[1]))

if blockDuration <= 0 and hits >= limit then
  local oldest = redis.call('ZRANGE', KEYS[1], 0, 0, 'WITHSCORES')
  local retryAfter = ttl
  if oldest[2] then
    retryAfter = math.max(1, tonumber(oldest[2]) + ttl - now)
  end
  local windowTtl = math.max(1, redis.call('PTTL', KEYS[1]))
  return {hits + 1, math.ceil(windowTtl / 1000), 1, math.ceil(retryAfter / 1000)}
end

local sequence = redis.call('INCR', KEYS[3])
redis.call('ZADD', KEYS[1], now, tostring(now) .. ':' .. tostring(sequence))
hits = hits + 1
redis.call('PEXPIRE', KEYS[1], ttl)
redis.call('PEXPIRE', KEYS[3], math.max(ttl, blockDuration))

if blockDuration > 0 and hits > limit then
  redis.call('SET', KEYS[2], '1', 'PX', blockDuration)
  redis.call('PEXPIRE', KEYS[1], blockDuration)
  redis.call('PEXPIRE', KEYS[3], blockDuration)
  return {hits, math.ceil(blockDuration / 1000), 1, math.ceil(blockDuration / 1000)}
end

return {hits, math.ceil(ttl / 1000), 0, 0}
`;

export class RedisThrottlerStorage implements ThrottlerStorage {
  private readonly prefix =
    process.env.THROTTLE_REDIS_PREFIX?.trim() || 'spotify:throttle';

  constructor(private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<StorageRecord> {
    const digest = createHash('sha256')
      .update(`${throttlerName}:${key}`)
      .digest('hex');
    // The hash tag keeps every key in one slot if Redis Cluster is introduced.
    const base = `${this.prefix}:{${digest}}`;
    const result = await this.redis.eval(
      INCREMENT_SCRIPT,
      3,
      `${base}:hits`,
      `${base}:block`,
      `${base}:sequence`,
      ttl,
      limit,
      blockDuration,
    );

    if (!Array.isArray(result) || result.length !== 4) {
      throw new Error('Redis returned an invalid throttler result');
    }

    const [totalHits, timeToExpire, isBlocked, timeToBlockExpire] =
      result.map(Number);
    if (
      ![totalHits, timeToExpire, isBlocked, timeToBlockExpire].every(
        Number.isFinite,
      )
    ) {
      throw new Error('Redis returned an invalid throttler result');
    }

    return {
      totalHits,
      timeToExpire,
      isBlocked: isBlocked === 1,
      timeToBlockExpire,
    };
  }
}
