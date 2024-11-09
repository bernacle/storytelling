import { makeAnalyzeScriptUseCase } from '@/modules/scripts/use-cases/factories/make-analyze-script-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createScriptParamsSchema = z.object({
    content: z.string(),
    target_emotion: z.string().optional(),
  })

  const { content, target_emotion } = createScriptParamsSchema.parse(request.body)

  const analyzeScriptUseCase = makeAnalyzeScriptUseCase()

  const { script } = await analyzeScriptUseCase.execute({
    content,
    targetEmotion: target_emotion,
    userId: request.user.id
  })

  return reply.status(201).send({ script })
}
