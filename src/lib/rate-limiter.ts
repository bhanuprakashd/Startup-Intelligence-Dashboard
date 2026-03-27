import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/services/cache";

// In-memory fallback using a simple sliding window when Redis is not configured
const memoryWindows = new Map<string, number[]>();

function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const hits = (memoryWindows.get(key) ?? []).filter((t) => t > windowStart);
  hits.push(now);
  memoryWindows.set(key, hits);

  const remaining = Math.max(0, limit - hits.length);
  const reset = Math.ceil((now + windowMs) / 1000);
  return { success: hits.length <= limit, remaining, reset };
}

// Sliding window: 10 requests per 60 seconds per identifier
const redisRatelimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "60 s"),
      prefix: "rl:linkedin",
    })
  : null;

export async function checkRateLimit(identifier: string): Promise<{
  success: boolean;
  remaining: number;
  reset: number;
}> {
  if (redisRatelimit) {
    const result = await redisRatelimit.limit(identifier);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: Math.ceil(result.reset / 1000),
    };
  }

  return memoryRateLimit(identifier, 10, 60_000);
}
