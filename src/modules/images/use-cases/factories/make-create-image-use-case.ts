import { imageQueue } from '@/lib/queue'
import { PrismaScriptsRepository } from '@/modules/scripts/repositories/prisma/prisma-scripts-repository'
import { PrismaImagesRepository } from '../../repositories/prisma/prisma-images-repository'
import { CreateImageUseCase } from '../create-image-use-case'

export function makeCreateImageUseCase() {
  const imagesRepository = new PrismaImagesRepository()
  const scriptsRepository = new PrismaScriptsRepository()

  return new CreateImageUseCase(
    scriptsRepository,
    imagesRepository,
    imageQueue
  )
}