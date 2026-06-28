import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export async function connectRedis() {
  if (redisClient.isOpen) return;

  await redisClient.connect();

  console.log("✅ Redis Connected");
}

export default redisClient;