import type { ImageGenerationProvider } from "@/providers/image-generation/image-generation-provider";
import { Job, Worker } from 'bullmq';
import type * as IORedis from 'ioredis';
import type { ImagesRepository } from "../repositories/images-repository";

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

// Pro account settings
export const PRO_SETTINGS = {
  minRequestInterval: 5 * 1000,     // 5 seconds between requests (was 20)
  concurrency: 5,                   // Process 5 jobs at once (was 2)
  limiterMax: 10,                   // Allow 10 requests per minute (was 2)
  retryDelay: 10 * 1000,           // Retry after 10s instead of 60s
  maxRetries: 5                     // Increase max retries
} as const;

let lastRequestTime = 0;

async function enforceRateLimit() {
  const now = Date.now()
  const timeSinceLastRequest = now - lastRequestTime
  if (timeSinceLastRequest < PRO_SETTINGS.minRequestInterval) {
    const delay = PRO_SETTINGS.minRequestInterval - timeSinceLastRequest
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
      errorMessage.includes('too many requests') ||
      errorMessage.includes('model too busy')
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
      const { imageId, scriptId, sceneIndex, imageOptions } = job.data;
      const logContext = sceneIndex !== undefined
        ? `scene ${sceneIndex} of script ${scriptId}`
        : `script ${scriptId}`;

      console.log(`[Worker] Processing image generation for ${logContext}`);

      try {
        await imagesRepository.updateStatus(imageId, 'PROCESSING');

        console.log('Generating image with options:', {
          style: imageOptions.style,
          promptLength: imageOptions.prompt.length,
          sceneIndex,
          attempt: job.attemptsMade + 1,
          maxAttempts: PRO_SETTINGS.maxRetries
        });

        await enforceRateLimit();

        const result = await imageProvider.generate({
          prompt: imageOptions.prompt,
          style: imageOptions.style
        });

        console.log(`Image generation successful for ${logContext}:`, {
          imageId,
          imageUrlLength: result.imageUrl.length
        });

        await imagesRepository.updateStatus(imageId, 'COMPLETED', {
          image_url: result.imageUrl
        });

        return { success: true, imageUrl: result.imageUrl };
      } catch (error) {
        if (isRateLimitError(error)) {
          console.log('Rate limit or model busy, retrying shortly...', {
            attempt: job.attemptsMade + 1,
            maxAttempts: PRO_SETTINGS.maxRetries,
            retryDelay: PRO_SETTINGS.retryDelay
          });

          await new Promise(resolve => setTimeout(resolve, PRO_SETTINGS.retryDelay));
          throw error;
        }

        console.error('Image generation error:', {
          error: error instanceof Error ? error.stack : error,
          imageId,
          scriptId,
          sceneIndex,
          options: imageOptions,
          attempt: job.attemptsMade + 1
        });

        // Only update to FAILED if we're out of retries
        if (job.attemptsMade + 1 >= PRO_SETTINGS.maxRetries) {
          await imagesRepository.updateStatus(imageId, 'FAILED', {
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }

        throw error;
      }
    },
    {
      connection,
      concurrency: PRO_SETTINGS.concurrency,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
      prefix: 'storytelling',
      limiter: {
        max: PRO_SETTINGS.limiterMax,
        duration: 1000 * 60 // per minute
      },
      settings: {
        backoffStrategy: (attemptsMade: number) => {
          return Math.min(PRO_SETTINGS.retryDelay * Math.pow(2, attemptsMade), 30000);
        }
      }
    }
  );

  worker.on('failed', (job, error) => {
    if (!isRateLimitError(error) || (job?.attemptsMade ?? 0) >= PRO_SETTINGS.maxRetries) {
      console.error(`[Worker] Failed job ${job?.id} after ${job?.attemptsMade ?? 0} attempts:`, error);
    }
  });

  return worker;
}