import { FastifyInstance } from 'fastify'
import { create } from './create'


export async function musicsRoutes(app: FastifyInstance) {
  app.post('/musics', create)
}
