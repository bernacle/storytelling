import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { makeCreateStoryUseCase } from '../use-cases/factories/make-create-story-use-case'

export async function create(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createStorySchema = z.object({
    script_id: z.string().uuid(),
    style: z.enum(['REALISTIC', 'CARTOON', 'MINIMALISTIC']).default('REALISTIC'),
    music_mood: z.enum(['UPBEAT', 'DRAMATIC', 'CALM']).default('DRAMATIC'),
    voice_options: z.object({
      gender: z.enum(['male', 'female']).optional(),
      accent: z.enum(['american', 'british', 'australian', 'indian', 'irish']).optional(),
      age_group: z.enum(['youth', 'adult', 'senior']).optional(),
      style: z.enum(['narrative', 'advertising', 'gaming']).optional()
    }).optional()
  })

  const {
    script_id,
    style,
    music_mood,
    voice_options
  } = createStorySchema.parse(request.body)

  const createStoryUseCase = makeCreateStoryUseCase()
  const { story } = await createStoryUseCase.execute({
    scriptId: script_id,
    style,
    musicMood: music_mood,
    voiceOptions: voice_options ? {
      gender: voice_options.gender,
      accent: voice_options.accent,
      ageGroup: voice_options.age_group,
      style: voice_options.style
    } : undefined
  })

  return reply.status(202).send({ story })
}