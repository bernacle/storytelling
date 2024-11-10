import { env } from '@/env'
import Redis from 'ioredis'

export const redis = new Redis({
  host: env.REDIS_HOST || 'localhost',
  port: Number(env.REDIS_PORT) || 6379,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
})
