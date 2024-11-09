import { Queue } from 'bullmq'
import { PrismaScriptsRepository } from '@/modules/scripts/repositories/prisma/prisma-scripts-repository'
import { PrismaVoicesRepository } from '../../repositories/prisma/prisma-voices-repository'
import { CreateVoiceUseCase } from '../create-voice-use-case'
import { redis } from '@/lib/redis'

export function makeCreateVoiceUseCase(): CreateVoiceUseCase {

  const voiceQueue = new Queue('voice-generation', {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 1000
    }
  })

  return new CreateVoiceUseCase(
    new PrismaScriptsRepository(),
    new PrismaVoicesRepository(),
    voiceQueue
  )
}