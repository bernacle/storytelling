import { PrismaVoicesRepository } from '../../repositories/prisma/prisma-voices-repository'
import { GetVoiceUseCase } from '../get-voice-use-case'

export function makeGetVoiceUseCase(): GetVoiceUseCase {
  return new GetVoiceUseCase(
    new PrismaVoicesRepository(),
  )
}