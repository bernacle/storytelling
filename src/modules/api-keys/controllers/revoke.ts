import { makeRevokeApiKeysUseCase } from '@/modules/api-keys/use-cases/factories/make-revoke-api-key-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function revoke(request: FastifyRequest, reply: FastifyReply) {
  const revokeApiKeyParamsSchema = z.object({
    id: z.string(),
  })

  const { id } = revokeApiKeyParamsSchema.parse(request.params)

  const revokeApiKeyUseCase = makeRevokeApiKeysUseCase()

  const { apiKey } = await revokeApiKeyUseCase.execute({
    id
  })

  return reply.status(201).send({ apiKey })
}
