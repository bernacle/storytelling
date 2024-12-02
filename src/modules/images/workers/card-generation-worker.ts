import type { ImageGenerationProvider } from "@/providers/image-generation/image-generation-provider";
import { Job, Worker } from "bullmq";
import type * as IORedis from "ioredis";
import type { CardsRepository } from "../repositories/cards-repository";

type CardGenerationJob = {
  cardId: string;
  scriptId: string;
  options: {
    prompt: string;
  };
};

const QUEUE_NAME = "generate-card";

export const CARD_WORKER_SETTINGS = {
  minRequestInterval: 5000,
  concurrency: 5,
  retryDelay: 10000,
  maxRetries: 5,
};

export function createCardWorker(
  connection: IORedis.Redis,
  cardsRepository: CardsRepository,
  cardGenerationProvider: ImageGenerationProvider
) {
  const worker = new Worker<CardGenerationJob>(
    QUEUE_NAME,
    async (job: Job) => {
      const { cardId, options } = job.data;

      console.log(`[Worker] Processing card generation for card ${cardId}`);

      try {
        // Update card status to PROCESSING
        await cardsRepository.updateStatus(cardId, "PROCESSING");

        // Generate the card background
        const baseImage = await cardGenerationProvider.generate({
          prompt: options.prompt,
        });

        // Save the generated card URL
        await cardsRepository.updateStatus(cardId, "COMPLETED", {
          card_url: baseImage.imageUrl,
        });

        console.log(`[Worker] Card generation completed for card ${cardId}`);
      } catch (error) {
        console.error(`[Worker] Failed to generate card ${cardId}:`, error);

        // Update status to FAILED if retries are exhausted
        if ((job?.attemptsMade || 0) >= CARD_WORKER_SETTINGS.maxRetries) {
          await cardsRepository.updateStatus(cardId, "FAILED", {
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }

        throw error;
      }
    },
    {
      connection,
      concurrency: CARD_WORKER_SETTINGS.concurrency,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
    }
  );

  worker.on("failed", (job, error) => {
    if (!job) {
      console.error("[Worker] Job is undefined:", error);
      return;
    }
    console.error(`[Worker] Card generation failed for job ${job.id}:`, error);
  });

  return worker;
}


