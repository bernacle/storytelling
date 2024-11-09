import { makeCreateVoiceUseCase } from '@/modules/voices/use-cases/factories/make-create-voice-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createVoiceSchema = z.object({
    scriptId: z.string().uuid(),
    voiceId: z.string(),
    tone: z.string().optional(),
    speed: z.number().min(0.5).max(2).optional(),
  })
  const { scriptId, voiceId, tone, speed } = createVoiceSchema.parse(request.body)

  const analyzeVoiceUseCase = makeCreateVoiceUseCase()

  const { voice } = await analyzeVoiceUseCase.execute({
    scriptId, voiceId, toneInput: tone, speed,
  })

  return reply.status(202).send({ voice })
}
