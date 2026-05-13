import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
export const redis = new Redis(REDIS_URL);

export async function getUSSDSession(sessionId: string): Promise<any> {
  const data = await redis.get(`ussd:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

export async function setUSSDSession(sessionId: string, data: any, ttl = 300): Promise<void> {
  await redis.setex(`ussd:${sessionId}`, ttl, JSON.stringify(data));
}