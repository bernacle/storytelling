import { makeCreateMusicUseCase } from '@/modules/musics/use-cases/factories/make-create-music-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function create(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createMusicSchema = z.object({
    script_id: z.string().uuid(),
  })

  const { script_id } = createMusicSchema.parse(request.body)

  const createMusicUseCase = makeCreateMusicUseCase()

  const { music } = await createMusicUseCase.execute({
    scriptId: script_id,
  })

  return reply.status(202).send({ music })
}
