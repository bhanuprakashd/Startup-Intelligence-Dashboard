import { Redis } from "@upstash/redis";

export const CACHE_TTL = {
  streaming: 300,
  funding: 600,
  onDemand: 1800,
  aiSynthesis: 3600,
  pulse: 900,
  radar: 7200,
} as const;

// In-memory fallback when Redis is not configured
const memoryCache = new Map<string, { data: unknown; expiry: number }>();

const hasRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

const redis = hasRedis
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (redis) {
    return redis.get<T>(key);
  }
  // In-memory fallback
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number
): Promise<void> {
  if (redis) {
    await redis.set(key, value, { ex: ttlSeconds });
  } else {
    memoryCache.set(key, {
      data: value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }
}

export async function cacheGetOrFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) return cached;

  const fresh = await fetcher();
  await cacheSet(key, fresh, ttlSeconds);
  return fresh;
}

export { redis };
