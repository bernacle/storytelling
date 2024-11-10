import 'dotenv/config'
import { z } from 'zod'


const envSchema = z.object({
  NODE_ENV: z.enum(['dev', 'test', 'production']).default('dev'),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  REDIS_HOST: z.string(),
  REDIS_PORT: z.string(),
  REDIS_PASSWORD: z.string(),
  GROQ_API_KEY: z.string(),
  PLAYHT_API_KEY: z.string(),
  PLAYHT_USER_ID: z.string(),
  OPENAI_API_KEY: z.string(),
  REPLICATE_API_TOKEN: z.string(),
  REPLICATE_VERSION: z.string(),
  HUGGINGFACE_API_TOKEN: z.string(),
  HUGGINGFACE_API_URL: z.string(),
  DEEPGRAM_API_KEY: z.string(),
  DEEPGRAM_URL: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())

  throw new Error('Invalid environment variables.')
}

export const env = _env.data