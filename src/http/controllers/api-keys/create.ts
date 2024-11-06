import { makeCreateApiKeyUseCase } from '@/use-cases/factories/make-create-api-key-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createApiKeyParamsSchema = z.object({
    label: z.string().email(),
  })

  const { label } = createApiKeyParamsSchema.parse(request.body)

  const createApiKeyUseCase = makeCreateApiKeyUseCase()

  const { apiKey } = await createApiKeyUseCase.execute({
    label,
    userId: "userId"
  })

  return reply.status(201).send({ apiKey })
}
