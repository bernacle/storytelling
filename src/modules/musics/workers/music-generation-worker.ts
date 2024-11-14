import type { MusicGenerationProvider } from "@/providers/music-generation/music-generation-provider";
import type { MusicMood } from "@prisma/client";
import { Job, Worker } from "bullmq";
import type * as IORedis from "ioredis";
import type { MusicsRepository } from "../repositories/musics-repository";

type MusicGenerationJob = {
  musicId: string;
  scriptId: string;
  mood: MusicMood;
  emotions: string[];
};

export function createMusicWorker(
  connection: IORedis.Redis,
  musicsRepository: MusicsRepository,
  musicProvider: MusicGenerationProvider
) {
  const worker = new Worker<MusicGenerationJob>(
    "generate-music",
    async (job: Job<MusicGenerationJob>) => {
      const { musicId, scriptId, mood, emotions } = job.data;

      try {
        console.log(`Processing music generation for script ${scriptId}`);
        await musicsRepository.updateStatus(musicId, "PROCESSING");

        console.log("Generating music with options:", {
          mood,
          emotionsCount: emotions.length
        });

        let attempts = 0;
        const maxAttempts = 3;
        let lastError: Error | null = null;

        while (attempts < maxAttempts) {
          try {
            const result = await musicProvider.generate({
              mood,
              emotions,
              duration: 30 // seconds
            });

            console.log("Music generation successful:", {
              musicId,
              audioUrlLength: result.audioUrl.length
            });

            await musicsRepository.updateStatus(musicId, "COMPLETED", {
              audio_url: result.audioUrl
            });

            return { success: true, audioUrl: result.audioUrl };
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            attempts++;

            if (attempts < maxAttempts) {
              const delay = Math.pow(2, attempts) * 1000; // exponential backoff
              console.log(`Music generation attempt ${attempts} failed, retrying in ${delay}ms`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }

        // If we get here, all attempts failed
        throw lastError;
      } catch (error) {
        console.error("Music generation error:", {
          error: error instanceof Error ? error.stack : error,
          musicId,
          scriptId
        });

        await musicsRepository.updateStatus(musicId, "FAILED", {
          error: error instanceof Error ? error.message : "Unknown error"
        });

        throw error;
      }
    },
    {
      connection,
      concurrency: 2,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
      prefix: "storytelling",
      limiter: {
        max: 2,
        duration: 1000 * 60
      }
    }
  );

  worker.on("failed", (job, error) => {
    console.error(`[Worker] Failed job ${job?.id}:`, error);
  });

  return worker;
}