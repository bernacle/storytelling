import { PrismaImagesRepository } from "../../repositories/prisma/prisma-images-repository"
import { createImageWorker } from "../image-generation-worker"
import { redis } from '@/lib/redis'
import { makeImageProvider } from "@/providers/image-generation/factories/make-image-provider"

export function makeImageWorker() {
  const imagesRepository = new PrismaImagesRepository()

  const imageProvider = makeImageProvider({ provider: 'huggingface' })

  return createImageWorker(
    redis,
    imagesRepository,
    imageProvider
  )
}