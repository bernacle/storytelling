import type { ScriptsRepository } from "@/modules/scripts/repositories/scripts-repository";
import type { ImageGenerationProvider } from "@/providers/image-generation/image-generation-provider";
import { ConnectionOptions, Job, Worker } from 'bullmq'
import type { ImagesRepository } from "../repositories/images-repository";
import type * as IORedis from 'ioredis'

type ImageGenerationJob = {
  imageId: string;
  scriptId: string;
  imageOptions: {
    prompt: string;
    style: 'REALISTIC' | 'CARTOON' | 'MINIMALISTIC';
  }
}

export function createImageWorker(
  connection: IORedis.Redis | IORedis.Cluster,
  imagesRepository: ImagesRepository,
  scriptsRepository: ScriptsRepository,
  imageProvider: ImageGenerationProvider,
) {
  return new Worker<ImageGenerationJob>(
    'generate-image',
    async (job: Job) => {
      const { imageId, scriptId, imageOptions } = job.data

      try {
        console.log(`Processing image generation for script ${scriptId}`)

        await imagesRepository.updateStatus(imageId, 'PROCESSING')

        console.log('Generating image with options:', {
          style: imageOptions.style,
          promptLength: imageOptions.prompt.length
        })

        const result = await imageProvider.generate({
          prompt: imageOptions.prompt,
          style: imageOptions.style.toLowerCase()
        })

        console.log('Image generation successful:', {
          imageId,
          imageUrlLength: result.imageUrl.length
        })

        await imagesRepository.updateStatus(imageId, 'COMPLETED', {
          image_url: result.imageUrl
        })
      } catch (error) {
        console.error('Image generation error:', {
          error: error instanceof Error ? error.stack : error,
          imageId,
          scriptId,
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
      concurrency: 5
    }
  )
}