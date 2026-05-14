// lib/redis.ts
//import Redis from 'ioredis'; // or your redis package

let client: Redis | null = null;

export function getRedis() {
  // Only connect if we haven't already
  if (!client) {
    // If REDIS_URL is not set, return null so the build doesn't crash
    if (!process.env.REDIS_URL) {
      console.warn('REDIS_URL is not defined. Redis connection skipped.');
      return null;
    }

    try {
      client = new Redis(process.env.REDIS_URL);
      console.log('Redis connected successfully');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      client = null;
    }
  }
  return client;
}