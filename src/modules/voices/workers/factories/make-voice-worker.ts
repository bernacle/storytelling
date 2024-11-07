import { PrismaScriptsRepository } from "@/modules/scripts/repositories/prisma/prisma-scripts-repository"
import Redis from 'ioredis'
import { PrismaVoicesRepository } from "../../repositories/prisma/prisma-voices-repository"
import { createVoiceWorker } from "../voice-generation-worker"
import { PlayHTProvider } from "@/providers/voice-generation/impl/playht-voice-generation-provider"

export function makeVoiceWorker() {
  const voicesRepository = new PrismaVoicesRepository()
  const scriptsRepository = new PrismaScriptsRepository()

  const connection = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  })

  return createVoiceWorker(
    connection,
    voicesRepository,
    scriptsRepository,
    new PlayHTProvider()
  )
}