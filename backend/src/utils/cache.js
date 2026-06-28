import redisClient from "../config/redis.js";

export async function getCache(key) {
  if (!redisClient.isOpen) {
    return null;
  }

  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis GET Error:", err);
    return null;
  }
}

export async function setCache(key, value, ttl = 300) {
  if (!redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(value));
  } catch (err) {
    console.error("Redis SET Error:", err);
  }
}

export async function deleteCache(key) {
  if (!redisClient.isOpen) {
    return;
  }

  try {
    await redisClient.del(key);
  } catch (err) {
    console.error("Redis DEL Error:", err);
  }
}

export async function deleteCacheByPattern(pattern) {
  if (!redisClient.isOpen) {
    return;
  }

  try {
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (err) {
    console.error("Redis Pattern Delete Error:", err);
  }
}