import { Job, Worker } from "bullmq";
import type * as IORedis from "ioredis";
import type { MusicMood } from "@prisma/client";
import type { MusicsRepository } from "../repositories/musics-repository";
import type { MusicGenerationProvider } from "@/providers/music-generation/music-generation-provider";

type MusicGenerationJob = {
  musicId: string;
  mood: MusicMood;
  duration: number;
};

export function createMusicWorker(
  connection: IORedis.Redis,
  musicsRepository: MusicsRepository,
  musicsProvider: MusicGenerationProvider
) {
  const worker = new Worker<MusicGenerationJob>(
    "generate-music",
    async (job: Job) => {
      const { musicId, mood, duration } = job.data;

      try {
        console.log(`Processing music generation for ${musicId}`);
        await musicsRepository.updateStatus(musicId, "PROCESSING");

        console.log("Generating music with options:", {
          mood,
          duration
        });

        const result = await musicsProvider.generate(mood, duration);

        console.log("Music generation successful:", {
          musicId,
          audioUrlLength: result.audioUrl.length
        });

        await musicsRepository.updateStatus(musicId, "COMPLETED", {
          audio_url: result.audioUrl
        });

        return { success: true, audioUrl: result.audioUrl };
      } catch (error) {
        console.error("Music generation error:", {
          error: error instanceof Error ? error.stack : error,
          musicId,
          mood,
          duration
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
