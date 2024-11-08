import { makeCreateUserUseCase } from '@/modules/users/use-cases/factories/make-create-user-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { UserAlreadyExistsError } from '../use-cases/errors/user-already-exists-error'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createUserParamsSchema = z.object({
    email: z.string().email(),
  })

  const { email } = createUserParamsSchema.parse(request.body)

  try {
    const createUserUseCase = makeCreateUserUseCase()

    const { user } = await createUserUseCase.execute({
      email
    })

    return reply.status(201).send({ user })
  } catch (err) {
    if (err instanceof UserAlreadyExistsError) {
      return reply.status(409).send({ message: err.message })
    }
    throw err
  }
}
