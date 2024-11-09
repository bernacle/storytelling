import { makeListApiKeysUseCase } from '@/modules/api-keys/use-cases/factories/make-list-api-keys-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listApiKeysUseCase = makeListApiKeysUseCase()

  const listApiKeysParamsSchema = z.object({
    user_id: z.string(),
  })


  const { user_id } = listApiKeysParamsSchema.parse(request.query)


  const { apiKeys } = await listApiKeysUseCase.execute({
    userId: user_id
  })

  return reply.status(201).send({ apiKeys })
}
