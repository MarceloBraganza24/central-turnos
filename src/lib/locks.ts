import { redis } from "@/lib/redis";

export async function acquireLock(key: string, ttlSeconds = 60) {
  const result = await redis.set(`lock:${key}`, "1", {
    nx: true,
    ex: ttlSeconds,
  });

  return result === "OK";
}

export async function releaseLock(key: string) {
  await redis.del(`lock:${key}`);
}