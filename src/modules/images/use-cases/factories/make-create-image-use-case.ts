import { redis } from "@/lib/redis"
import { PrismaScriptsRepository } from "@/modules/scripts/repositories/prisma/prisma-scripts-repository"
import { Queue } from "bullmq"
import { PrismaImagesRepository } from "../../repositories/prisma/prisma-images-repository"
import { CreateImageUseCase } from "../create-image-use-case"

export function makeCreateImageUseCase(): CreateImageUseCase {
  const scriptsRepository = new PrismaScriptsRepository()
  const imagesRepository = new PrismaImagesRepository()

  const imageQueue = new Queue('generate-image', {
    connection: redis,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 1000
    }
  })

  return new CreateImageUseCase(
    scriptsRepository,
    imagesRepository,
    imageQueue
  )
}