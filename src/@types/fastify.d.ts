import { FastifyRequest as OriginalFastifyRequest } from 'fastify'

declare module 'fastify' {
  export interface FastifyRequest extends OriginalFastifyRequest {
    user: {
      id: string
    }
    apiKey: {
      id: string
      label: string
    }
  }
}