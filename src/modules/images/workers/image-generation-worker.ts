import type { ImageGenerationProvider } from "@/providers/image-generation/image-generation-provider";
import { Job, Worker } from 'bullmq'
import type { ImagesRepository } from "../repositories/images-repository";
import type * as IORedis from 'ioredis'

type ImageGenerationJob = {
  imageId: string;
  scriptId: string;
  sceneIndex?: number;
  imageOptions: {
    prompt: string;
    style: string;
  }
}

const QUEUE_NAME = 'generate-image'
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL = 20 * 1000

async function enforceRateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime

  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delay = MIN_REQUEST_INTERVAL - timeSinceLastRequest
    await new Promise(resolve => setTimeout(resolve, delay))
  }

  lastRequestTime = Date.now()
}

function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase()
    return (
      errorMessage.includes('rate limit') ||
      errorMessage.includes('429') ||
      errorMessage.includes('max requests') ||
      errorMessage.includes('too many requests')
    )
  }
  return false;
}

export function createImageWorker(
  connection: IORedis.Redis,
  imagesRepository: ImagesRepository,
  imageProvider: ImageGenerationProvider,
) {
  const worker = new Worker<ImageGenerationJob>(
    QUEUE_NAME,
    async (job: Job) => {
      const { imageId, scriptId, sceneIndex, imageOptions } = job.data

      const logContext = sceneIndex !== undefined
        ? `scene ${sceneIndex} of script ${scriptId}`
        : `script ${scriptId}`

      console.log(`[Worker] Processing image generation for ${logContext}`)

      try {
        await imagesRepository.updateStatus(imageId, 'PROCESSING')

        console.log('Generating image with options:', {
          style: imageOptions.style,
          promptLength: imageOptions.prompt.length,
          sceneIndex
        })

        await enforceRateLimit()

        const result = await imageProvider.generate({
          prompt: imageOptions.prompt,
          style: imageOptions.style
        })

        console.log(`Image generation successful for ${logContext}:`, {
          imageId,
          imageUrlLength: result.imageUrl.length
        })

        await imagesRepository.updateStatus(imageId, 'COMPLETED', {
          image_url: result.imageUrl
        })

        return { success: true, imageUrl: result.imageUrl }
      } catch (error) {
        if (isRateLimitError(error)) {
          console.log('Rate limit hit, waiting before retry')
          await new Promise(resolve => setTimeout(resolve, 60 * 1000))
          throw error
        }

        console.error('Image generation error:', {
          error: error instanceof Error ? error.stack : error,
          imageId,
          scriptId,
          sceneIndex,
          options: imageOptions
        })

        await imagesRepository.updateStatus(imageId, 'FAILED', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        throw error
      }
    },
    {
      connection,
      concurrency: 2,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
      prefix: 'storytelling',
      limiter: {
        max: 2,
        duration: 1000 * 60
      }
    }
  )


  worker.on('failed', (job, error) => {
    if (!isRateLimitError(error)) {
      console.error(`[Worker] Failed job ${job?.id}:`, error)
    }
  })

  return worker
}