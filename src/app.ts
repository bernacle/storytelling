import fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from './env'

import { userRoutes } from '@/modules/users/controllers/routes';
import { scriptRoutes } from '@/modules/scripts/controllers/routes';
import { apiKeyRoutes } from '@/modules/api-keys/controllers/routes';
import { checkApiKey } from './hooks/check-api-key';

export const app = fastify()

app.register(async function publicRoutes(app) {
  app.get('/healthcheck', async (request, reply) => {
    return { status: "OK" };
  });
  app.register(userRoutes)
  app.register(apiKeyRoutes)
})

app.register(async function protectedRoutes(app) {
  app.addHook('preHandler', checkApiKey)
  app.register(scriptRoutes)
})


app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  }

  return reply.status(500).send({ message: 'Internal server error' })
})
