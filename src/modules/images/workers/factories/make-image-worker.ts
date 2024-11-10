import { PrismaScriptsRepository } from "@/modules/scripts/repositories/prisma/prisma-scripts-repository"
import { PrismaImagesRepository } from "../../repositories/prisma/prisma-images-repository"
import { createImageWorker } from "../image-generation-worker"
import { redis } from '@/lib/redis'
import OpenAI from 'openai'
import { makeImageProvider } from "@/providers/image-generation/factories/make-image-provider"

export function makeImageWorker() {
  const imagesRepository = new PrismaImagesRepository()
  const scriptsRepository = new PrismaScriptsRepository()


  const imageProvider = makeImageProvider({ provider: 'huggingface' })

  return createImageWorker(
    redis,
    imagesRepository,
    scriptsRepository,
    imageProvider
  )
}