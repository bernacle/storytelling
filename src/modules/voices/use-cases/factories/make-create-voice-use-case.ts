import { Queue } from 'bullmq'
import { PrismaScriptsRepository } from '@/modules/scripts/repositories/prisma/prisma-scripts-repository'
import { PrismaVoicesRepository } from '../../repositories/prisma/prisma-voices-repository'
import { CreateVoiceUseCase } from '../create-voice-use-case'
import { redis } from '@/lib/redis'
import { voiceQueue } from '@/lib/queue'

export function makeCreateVoiceUseCase(): CreateVoiceUseCase {
  return new CreateVoiceUseCase(
    new PrismaScriptsRepository(),
    new PrismaVoicesRepository(),
    voiceQueue
  )
}