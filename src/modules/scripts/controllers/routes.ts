import { FastifyInstance } from 'fastify'
import { analyze } from './analyze'
import { list } from './list'


export async function scriptRoutes(app: FastifyInstance) {
  app.post('/scripts/analyze', analyze)
  app.get('/scripts', list)
}
