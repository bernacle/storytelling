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
      const { imageId, imageOptions } = job.data

      try {
        await imagesRepository.updateStatus(imageId, 'PROCESSING')

        const result = await imageProvider.generate({
          prompt: imageOptions.prompt,
          style: imageOptions.style.toLowerCase()
        })

        await imagesRepository.updateStatus(imageId, 'COMPLETED', {
          image_url: result.imageUrl
        })
      } catch (error) {
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