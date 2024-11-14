import { FastifyInstance } from 'fastify'
import { create } from './create'


export async function storiesRoutes(app: FastifyInstance) {
  app.post('/stories', create)
}
