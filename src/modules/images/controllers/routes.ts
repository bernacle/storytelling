import { FastifyInstance } from 'fastify'
import { create } from './create'


export async function imagesRoutes(app: FastifyInstance) {
  app.post('/images', create)
}
