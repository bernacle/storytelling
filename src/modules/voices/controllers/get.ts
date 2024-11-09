import { makeCreateVoiceUseCase } from '@/modules/voices/use-cases/factories/make-create-voice-use-case'
import type { Voice } from '@prisma/client'
import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { makeGetVoiceUseCase } from '../use-cases/factories/make-get-voice-use-case'
import { VoiceNotFoundError } from '../use-cases/errors/voice-not-found-error'

export async function get(request: FastifyRequest, reply: FastifyReply) {
  const getVoiceSchema = z.object({
    id: z.string().uuid()
  })

  const { id } = getVoiceSchema.parse(request.params)

  const getVoiceUseCase = makeGetVoiceUseCase()

  try {

    const { voice } = await getVoiceUseCase.execute({ id })


    return handleVoiceResponse(voice, reply)

  } catch (err) {
    if (err instanceof VoiceNotFoundError) {
      return reply.status(404).send({ message: err.message })
    }
    throw err
  }
}



function handleVoiceResponse(voice: Voice, reply: FastifyReply) {
  switch (voice.status) {
    case 'COMPLETED':
      return reply.status(200).send({
        id: voice.id,
        status: voice.status,
        audioUrl: voice.audio_url
      })

    case 'FAILED':
      return reply.status(422).send({
        id: voice.id,
        status: voice.status,
        error: voice.error
      })

    case 'PENDING':
    case 'PROCESSING':
      return reply.status(202).send({
        id: voice.id,
        status: voice.status,
        message: 'Voice generation in progress'
      })
  }
}