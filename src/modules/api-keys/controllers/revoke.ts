import { makeRevokeApiKeysUseCase } from '@/modules/api-keys/use-cases/factories/make-revoke-api-key-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { ApiKeyRevoked } from '../use-cases/errors/api-key-already-revoked-error'

export async function revoke(request: FastifyRequest, reply: FastifyReply) {
  const revokeApiKeyParamsSchema = z.object({
    id: z.string(),
  })
  const revokeApiKeyBodySchema = z.object({
    user_id: z.string(),
  })

  const { id } = revokeApiKeyParamsSchema.parse(request.params)
  const { user_id } = revokeApiKeyBodySchema.parse(request.body)

  const revokeApiKeyUseCase = makeRevokeApiKeysUseCase()
  try {
    await revokeApiKeyUseCase.execute({
      id,
      userId: user_id
    })
  } catch (err) {
    if (err instanceof ApiKeyRevoked) {
      return reply.status(409).send({ message: err.message })
    }
    throw err
  }


  return reply.status(204).send()
}
