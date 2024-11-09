import { makeListScriptsUseCase } from '@/modules/scripts/use-cases/factories/make-list-script-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listScriptsUseCase = makeListScriptsUseCase()

  const listScriptsParamsSchema = z.object({
    user_id: z.string(),
  })


  const { user_id } = listScriptsParamsSchema.parse(request.query)


  const { scripts } = await listScriptsUseCase.execute({
    userId: user_id
  })

  return reply.status(201).send({ scripts })
}
