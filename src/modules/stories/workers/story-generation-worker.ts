import { Job, Worker } from 'bullmq';
import type { StoriesRepository } from '../repositories/stories-repository';
import type { VideoGenerationProvider } from '@/providers/video-generation/video-generation-provider';
import type * as IORedis from 'ioredis';
import type { AnalysisResponse } from '@/providers/text-analysis';
import type { MusicMood, Style } from '@prisma/client';

type StoryGenerationJob = {
  storyId: string;
  scriptId: string;
  voiceUrl: string;
  imageUrls: string[];
  style: Style;
  musicMood: MusicMood;
  scenes: AnalysisResponse['scenes'];
}

export function createStoryWorker(
  connection: IORedis.Redis,
  storiesRepository: StoriesRepository,
  videoProvider: VideoGenerationProvider,
) {
  const worker = new Worker<StoryGenerationJob>(
    'generate-story',
    async (job: Job) => {
      const { storyId, scriptId, voiceUrl, imageUrls, style, musicMood, scenes } = job.data;

      try {
        console.log('Starting video generation for story:', storyId);

        // Calculate scene durations if not provided
        const composition = {
          audio: {
            url: voiceUrl,
            type: 'narration'
          },
          scenes: scenes.map((scene: { duration: any; }, index: string | number) => ({
            image: imageUrls[index],
            duration: scene.duration || 5, // Default duration if not specified
            transition: 'fade',
            transitionDuration: 0.5
          })),
          style,
          music: {
            mood: musicMood,
            volume: 0.2 // Background music volume
          }
        };

        console.log('Generating video with composition:', {
          storyId,
          numberOfScenes: scenes.length,
          style,
          musicMood
        });

        const result = await videoProvider.generate(composition);

        console.log('Video generation successful:', {
          storyId,
          videoUrl: result.videoUrl
        });

        await storiesRepository.updateStatus(storyId, 'COMPLETED', {
          video_url: result.videoUrl
        });

        return { success: true, videoUrl: result.videoUrl };
      } catch (error) {
        console.error('Video generation error:', {
          error: error instanceof Error ? error.stack : error,
          storyId,
          scriptId
        });

        await storiesRepository.updateStatus(storyId, 'FAILED', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        throw error;
      }
    },
    {
      connection,
      concurrency: 1, // Video generation is resource-intensive
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
      prefix: 'storytelling',
      limiter: {
        max: 1,
        duration: 1000 * 60 * 5 // 5 minutes
      }
    }
  );

  worker.on('failed', (job, error) => {
    console.error(`[Worker] Failed job ${job?.id}:`, error);
  });

  return worker;
}
