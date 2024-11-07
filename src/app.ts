import fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from '@/env'

import { userRoutes } from '@/modules/users/controllers/routes';
import { scriptRoutes } from '@/modules/scripts/controllers/routes';
import { apiKeyRoutes } from '@/modules/api-keys/controllers/routes';

export const app = fastify()

app.get('/healthcheck', async (request, reply) => {
  return { status: env.DATABASE_URL };
});


app.register(scriptRoutes)
app.register(userRoutes)
app.register(apiKeyRoutes)


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
