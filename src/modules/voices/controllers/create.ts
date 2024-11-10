import { makeCreateVoiceUseCase } from '@/modules/voices/use-cases/factories/make-create-voice-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createVoiceSchema = z.object({
    script_id: z.string().uuid(),
    options: z.object({
      gender: z.enum(['male', 'female']).optional(),
      accent: z.enum(['american', 'british', 'australian', 'indian', 'irish']).optional(),
      age_group: z.enum(['youth', 'adult', 'senior']).optional(),
      style: z.enum(['narrative', 'advertising', 'gaming']).optional(),
    }).default({})
  })
  const { script_id, options } = createVoiceSchema.parse(request.body)

  const analyzeVoiceUseCase = makeCreateVoiceUseCase()

  const { voice } = await analyzeVoiceUseCase.execute({
    scriptId: script_id, options: {
      accent: options.accent,
      gender: options.gender,
      style: options.style,
      ageGroup: options.age_group
    }
  })

  return reply.status(202).send({ voice })
}
