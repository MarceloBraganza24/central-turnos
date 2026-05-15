import { redis } from "@/lib/redis";

export async function getCache<T>(key: string): Promise<T | null> {
  const cached = await redis.get<T>(key);
  return cached || null;
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds = 300
) {
  await redis.set(key, value, {
    ex: ttlSeconds,
  });
}

export async function deleteCache(key: string) {
  await redis.del(key);
}

export async function deleteCacheByPattern(pattern: string) {
  const keys: string[] = [];

  let cursor = 0;

  do {
    const [nextCursor, foundKeys] = await redis.scan(cursor, {
      match: pattern,
      count: 100,
    });

    cursor = Number(nextCursor);
    keys.push(...foundKeys);
  } while (cursor !== 0);

  if (keys.length > 0) {
    await redis.del(...keys);
  }
}