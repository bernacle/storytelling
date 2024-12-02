import { makeAnalyzeScriptUseCase } from '@/modules/scripts/use-cases/factories/make-analyze-script-use-case'
import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'

export async function analyze(request: FastifyRequest, reply: FastifyReply) {
  const analyzeScriptParamsSchema = z.object({
    content: z.string(),
    type: z.enum(['STORY', 'CARD']).default('STORY'),

  })

  const { content, type } = analyzeScriptParamsSchema.parse(request.body)

  const analyzeScriptUseCase = makeAnalyzeScriptUseCase()

  const { script } = await analyzeScriptUseCase.execute({
    content,
    type,
    userId: request.user.id
  })

  return reply.status(201).send({ script })
}
