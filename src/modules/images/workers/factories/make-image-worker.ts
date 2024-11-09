import { PrismaScriptsRepository } from "@/modules/scripts/repositories/prisma/prisma-scripts-repository"
import { PrismaImagesRepository } from "../../repositories/prisma/prisma-images-repository"
import { createImageWorker } from "../image-generation-worker"
import { redis } from '@/lib/redis'
import OpenAI from 'openai'
import { DallEProvider } from "@/providers/image-generation/impl/dall-e-image-generation-provider"

export function makeImageWorker() {
  const imagesRepository = new PrismaImagesRepository()
  const scriptsRepository = new PrismaScriptsRepository()

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  const imageProvider = new DallEProvider(openai)

  return createImageWorker(
    redis,
    imagesRepository,
    scriptsRepository,
    imageProvider
  )
}