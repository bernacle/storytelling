import type { AnalysisResponse } from '@/providers/text-analysis';
import type { VideoGenerationProvider } from '@/providers/video-generation/video-generation-provider';
import type { MusicMood, Style } from '@prisma/client';
import { Job, Worker } from 'bullmq';
import type * as IORedis from 'ioredis';
import type { StoriesRepository } from '../repositories/stories-repository';

type StoryGenerationJob = {
  storyId: string;
  scriptId: string;
  voiceUrl: string;
  imageUrls: string[];
  style: Style;
  musicMood: MusicMood;
  scenes: AnalysisResponse['scenes'];
}

// Helper function to calculate scene duration based on text length
function calculateSceneDuration(text: string): number {
  // Average reading speed is about 150-160 words per minute
  // We'll use 150 words per minute = 2.5 words per second
  const WORDS_PER_SECOND = 2.5;
  const MIN_DURATION = 5; // Minimum duration for very short scenes
  const MAX_DURATION = 15; // Maximum duration for very long scenes

  const wordCount = text.split(/\s+/).length;
  const calculatedDuration = Math.ceil(wordCount / WORDS_PER_SECOND);

  // Ensure duration is between MIN and MAX
  return Math.min(Math.max(calculatedDuration, MIN_DURATION), MAX_DURATION);
}

export function createStoryWorker(
  connection: IORedis.Redis,
  storiesRepository: StoriesRepository,
  videoProvider: VideoGenerationProvider,
) {
  const worker = new Worker<StoryGenerationJob>(
    'generate-story',
    async (job: Job<StoryGenerationJob>) => {
      const { storyId, scriptId, voiceUrl, imageUrls, style, musicMood, scenes } = job.data;

      try {
        await storiesRepository.updateStatus(storyId, 'PROCESSING');
        console.log('Starting video generation for story:', storyId);

        if (!scenes.length || !imageUrls.length || !voiceUrl) {
          throw new Error('Missing required assets for video generation');
        }

        const composition = {
          audio: {
            url: voiceUrl,
            type: 'narration' as const
          },
          scenes: scenes.map((scene, index) => ({
            image: imageUrls[index],
            duration: calculateSceneDuration(scene.text),
            transition: 'fade' as const,
            transitionDuration: 0.5
          })),
          style,
          music: {
            mood: musicMood,
            volume: 0.2
          }
        };

        job.updateProgress(25);

        console.log('Generating video with composition:', {
          storyId,
          numberOfScenes: scenes.length,
          style,
          musicMood
        });

        const result = await videoProvider.generate(composition);

        job.updateProgress(90);

        console.log('Video generation successful:', {
          storyId,
          videoUrl: result.videoUrl
        });

        await storiesRepository.updateStatus(storyId, 'COMPLETED', {
          video_url: result.videoUrl
        });

        job.updateProgress(100);
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
      concurrency: 1,
      removeOnComplete: { count: 100 },
      removeOnFail: { count: 100 },
      prefix: 'storytelling',
      limiter: {
        max: 1,
        duration: 1000 * 60 * 5
      }
    }
  );

  worker.on('completed', (job) => {
    console.log(`[Worker] Completed story generation for job ${job.id}`);
  });

  worker.on('failed', (job, error) => {
    console.error(`[Worker] Failed job ${job?.id}:`, error);
  });

  worker.on('error', (error) => {
    console.error('[Worker] Story worker error:', error);
  });

  return worker;
}