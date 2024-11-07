import { create } from './create'
import { FastifyInstance } from 'fastify'


export async function scriptRoutes(app: FastifyInstance) {
  app.post('/scripts', create)
}
