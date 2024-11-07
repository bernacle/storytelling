import { makeListApiKeysUseCase } from '@/modules/api-keys/use-cases/factories/make-list-api-keys-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listApiKeysUseCase = makeListApiKeysUseCase()

  const { apiKeys } = await listApiKeysUseCase.execute({
    userId: "userId"
  })

  return reply.status(201).send({ apiKeys })
}
