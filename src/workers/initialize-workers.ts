import { redis } from "@/lib/redis"
import { PrismaImagesRepository } from "@/modules/images/repositories/prisma/prisma-images-repository"
import { createImageWorker } from "@/modules/images/workers/image-generation-worker"
import { PrismaMusicsRepository } from "@/modules/musics/repositories/prisma/prisma-musics-repository"
import { createMusicWorker } from "@/modules/musics/workers/music-generation-worker"
import { PrismaScriptsRepository } from "@/modules/scripts/repositories/prisma/prisma-scripts-repository"
import { PrismaStoriesRepository } from "@/modules/stories/repositories/prisma/prisma-stories-repository"
import { createStoryWorker } from "@/modules/stories/workers/story-generation-worker"
import { PrismaVoicesRepository } from "@/modules/voices/repositories/prisma/prisma-voices-repository"
import { createVoiceWorker } from "@/modules/voices/workers/voice-generation-worker"
import { makeImageProvider } from "@/providers/image-generation/factories/make-image-provider"
import { makeMusicProvider } from "@/providers/music-generation/factories/make-music-provider"
import { makeVideoProvider } from "@/providers/video-generation/factories/make-video-provider"
import { makeVoiceProvider } from "@/providers/voice-generation/factories/make-voice-provider"

export const voiceWorker = createVoiceWorker(redis, new PrismaVoicesRepository(), new PrismaScriptsRepository(), makeVoiceProvider({ provider: 'deepgram' }))
export const imageWorker = createImageWorker(redis, new PrismaImagesRepository(), makeImageProvider({ provider: 'huggingface' }))
export const storyWorker = createStoryWorker(redis, new PrismaStoriesRepository(), makeVideoProvider())
export const musicWorker = createMusicWorker(redis, new PrismaMusicsRepository(), makeMusicProvider())