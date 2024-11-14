import { storyQueue } from '@/lib/queue'
import { PrismaImagesRepository } from '@/modules/images/repositories/prisma/prisma-images-repository'
import { makeCreateImageUseCase } from '@/modules/images/use-cases/factories/make-create-image-use-case'
import { PrismaMusicsRepository } from '@/modules/musics/repositories/prisma/prisma-musics-repository'
import { makeCreateMusicUseCase } from '@/modules/musics/use-cases/factories/make-create-music-use-case'
import { PrismaScriptsRepository } from '@/modules/scripts/repositories/prisma/prisma-scripts-repository'
import { PrismaStoriesRepository } from '@/modules/stories/repositories/prisma/prisma-stories-repository'
import { PrismaVoicesRepository } from '@/modules/voices/repositories/prisma/prisma-voices-repository'
import { makeCreateVoiceUseCase } from '@/modules/voices/use-cases/factories/make-create-voice-use-case'
import { CreateStoryUseCase } from '../create-story-use-case'

export function makeCreateStoryUseCase() {
  const scriptsRepository = new PrismaScriptsRepository()
  const voicesRepository = new PrismaVoicesRepository()
  const imagesRepository = new PrismaImagesRepository()
  const storiesRepository = new PrismaStoriesRepository()
  const musicsRepository = new PrismaMusicsRepository()
  const createVoiceUseCase = makeCreateVoiceUseCase()
  const createImageUseCase = makeCreateImageUseCase()
  const createMusicUseCase = makeCreateMusicUseCase();

  const useCase = new CreateStoryUseCase(
    scriptsRepository,
    voicesRepository,
    imagesRepository,
    storiesRepository,
    musicsRepository,
    createVoiceUseCase,
    createImageUseCase,
    createMusicUseCase,
    storyQueue
  );

  return useCase
}