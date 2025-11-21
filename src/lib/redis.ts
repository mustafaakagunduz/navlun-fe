/**
 * Redis Client for Next.js
 * Upstash Redis kullanarak serverless-friendly implementation
 */

import { Redis } from '@upstash/redis';

// Upstash Redis instance oluştur (environment variables'tan)
const redis = new Redis({
  url: process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

export default redis;

/**
 * Redis Cache Utility Functions
 */

/**
 * Cache'den veri al
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get<T>(key);
    return data;
  } catch (error) {
    console.error(`Redis GET error for key ${key}:`, error);
    return null;
  }
}

/**
 * Cache'e veri kaydet
 */
export async function setToCache<T>(
  key: string,
  value: T,
  expirationSeconds?: number
): Promise<boolean> {
  try {
    if (expirationSeconds) {
      await redis.setex(key, expirationSeconds, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }
    return true;
  } catch (error) {
    console.error(`Redis SET error for key ${key}:`, error);
    return false;
  }
}

/**
 * Cache'den veri sil
 */
export async function deleteFromCache(key: string): Promise<boolean> {
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error(`Redis DELETE error for key ${key}:`, error);
    return false;
  }
}

/**
 * Key'in var olup olmadığını kontrol et
 */
export async function existsInCache(key: string): Promise<boolean> {
  try {
    const exists = await redis.exists(key);
    return exists === 1;
  } catch (error) {
    console.error(`Redis EXISTS error for key ${key}:`, error);
    return false;
  }
}

/**
 * Key'e expiration (TTL) ekle
 */
export async function setExpiration(
  key: string,
  seconds: number
): Promise<boolean> {
  try {
    await redis.expire(key, seconds);
    return true;
  } catch (error) {
    console.error(`Redis EXPIRE error for key ${key}:`, error);
    return false;
  }
}

/**
 * Increment (sayıyı artır)
 */
export async function incrementKey(key: string): Promise<number | null> {
  try {
    const result = await redis.incr(key);
    return result;
  } catch (error) {
    console.error(`Redis INCR error for key ${key}:`, error);
    return null;
  }
}

/**
 * Hash operations - Kullanıcı session için ideal
 */
export async function setHash(
  key: string,
  field: string,
  value: string
): Promise<boolean> {
  try {
    await redis.hset(key, { [field]: value });
    return true;
  } catch (error) {
    console.error(`Redis HSET error for key ${key}:`, error);
    return false;
  }
}

export async function getHash(
  key: string,
  field: string
): Promise<string | null> {
  try {
    const value = await redis.hget(key, field);
    return value;
  } catch (error) {
    console.error(`Redis HGET error for key ${key}:`, error);
    return null;
  }
}

export async function getAllHash(key: string): Promise<Record<string, string> | null> {
  try {
    const data = await redis.hgetall(key);
    return data;
  } catch (error) {
    console.error(`Redis HGETALL error for key ${key}:`, error);
    return null;
  }
}
