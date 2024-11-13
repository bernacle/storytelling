import { musicQueue } from '@/lib/queue'
import { PrismaScriptsRepository } from '@/modules/scripts/repositories/prisma/prisma-scripts-repository'
import { PrismaMusicsRepository } from '../../repositories/prisma/prisma-musics-repository'
import { CreateMusicUseCase } from '../create-music-use-case.'


export function makeCreateMusicUseCase() {
  const musicsRepository = new PrismaMusicsRepository()
  const scriptsRepository = new PrismaScriptsRepository()

  return new CreateMusicUseCase(
    scriptsRepository,
    musicsRepository,
    musicQueue
  )
}