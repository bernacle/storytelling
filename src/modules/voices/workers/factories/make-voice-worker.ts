import { PrismaScriptsRepository } from "@/modules/scripts/repositories/prisma/prisma-scripts-repository"
import { PrismaVoicesRepository } from "../../repositories/prisma/prisma-voices-repository"
import { createVoiceWorker } from "../voice-generation-worker"
import { PlayHTProvider } from "@/providers/voice-generation/impl/playht-voice-generation-provider"
import { redis } from '@/lib/redis'

export function makeVoiceWorker() {
  const voicesRepository = new PrismaVoicesRepository()
  const scriptsRepository = new PrismaScriptsRepository()

  const voiceProvider = new PlayHTProvider()

  return createVoiceWorker(
    redis,
    voicesRepository,
    scriptsRepository,
    voiceProvider
  )
}