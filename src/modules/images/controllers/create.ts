import { makeCreateImageUseCase } from '@/modules/images/use-cases/factories/make-create-image-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function create(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createImageSchema = z.object({
    script_id: z.string().uuid(),
    style: z.enum(['REALISTIC', 'CARTOON', 'MINIMALISTIC']).default('REALISTIC')
  })

  const { script_id, style } = createImageSchema.parse(request.body)

  const createImageUseCase = makeCreateImageUseCase()

  const { image } = await createImageUseCase.execute({
    scriptId: script_id,
    style
  })

  return reply.status(202).send({ image })
}
