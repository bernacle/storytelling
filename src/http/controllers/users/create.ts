import { makeCreateUserUseCase } from '@/use-cases/factories/make-create-user-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createUserParamsSchema = z.object({
    email: z.string().email(),
  })

  const { email } = createUserParamsSchema.parse(request.body)

  const createUserUseCase = makeCreateUserUseCase()

  const { user } = await createUserUseCase.execute({
    email
  })

  return reply.status(201).send({ user })
}
