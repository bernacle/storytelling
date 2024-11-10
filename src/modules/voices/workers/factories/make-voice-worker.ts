import { PrismaScriptsRepository } from "@/modules/scripts/repositories/prisma/prisma-scripts-repository"
import { PrismaVoicesRepository } from "../../repositories/prisma/prisma-voices-repository"
import { createVoiceWorker } from "../voice-generation-worker"
import { redis } from '@/lib/redis'
import { makeVoiceProvider } from "@/providers/voice-generation/factories/make-voice-provider"

export function makeVoiceWorker() {
  const voicesRepository = new PrismaVoicesRepository()
  const scriptsRepository = new PrismaScriptsRepository()

  const voiceProvider = makeVoiceProvider({ provider: 'deepgram' })

  return createVoiceWorker(
    redis,
    voicesRepository,
    scriptsRepository,
    voiceProvider
  )
}