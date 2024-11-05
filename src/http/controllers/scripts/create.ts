import { makeAnalyzeScriptUseCase } from '@/use-cases/factories/make-analyze-script-use-case'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createScriptParamsSchema = z.object({
    content: z.string(),
    targetEmotion: z.string().optional(),
  })


  const { content, targetEmotion } = createScriptParamsSchema.parse(request.body)

  const analyzeScriptUseCase = makeAnalyzeScriptUseCase()

  await analyzeScriptUseCase.execute({
    content,
    targetEmotion,
    userId: "userId"
  })

  return reply.status(201).send()
}
