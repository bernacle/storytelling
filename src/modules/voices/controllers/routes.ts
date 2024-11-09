import { FastifyInstance } from 'fastify'
import { create } from './create'
import { get } from './get'


export async function voicesRoutes(app: FastifyInstance) {
  app.post('/voices', create)
  app.get('/voices/:id', get)
}
