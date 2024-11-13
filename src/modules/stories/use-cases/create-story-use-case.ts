import type { StoriesRepository } from '../repositories/stories-repository';
import type { ScriptsRepository } from '@/modules/scripts/repositories/scripts-repository';
import type { VoicesRepository } from '@/modules/voices/repositories/voices-repository';
import type { ImagesRepository } from '@/modules/images/repositories/images-repository';
import { CreateVoiceUseCase } from '@/modules/voices/use-cases/create-voice-use-case';
import { CreateImageUseCase } from '@/modules/images/use-cases/create-image-use-case';
import type { Queue } from 'bullmq';
import type { Story, Style, MusicMood, RequestStatus } from '@prisma/client';
import { ScriptNotFoundError } from '@/modules/scripts/use-cases/errors/script-not-found-error';
import type { AnalysisResponse } from '@/providers/text-analysis';
import type { MusicsRepository } from '@/modules/musics/repositories/musics-repository';

type CreateStoryUseCaseRequest = {
  scriptId: string;
  style: Style;
  musicMood: MusicMood;
  voiceOptions?: {
    gender?: 'male' | 'female';
    accent?: 'american' | 'british' | 'australian' | 'indian' | 'irish';
    ageGroup?: 'youth' | 'adult' | 'senior';
    style?: 'narrative' | 'advertising' | 'gaming';
  };
}

export class CreateStoryUseCase {
  constructor(
    private readonly scriptsRepository: ScriptsRepository,
    private readonly voicesRepository: VoicesRepository,
    private readonly imagesRepository: ImagesRepository,
    private readonly storiesRepository: StoriesRepository,
    private readonly musicsRepository: MusicsRepository,
    private readonly createVoiceUseCase: CreateVoiceUseCase,
    private readonly createImageUseCase: CreateImageUseCase,
    private readonly storyQueue: Queue,
  ) { }

  private async ensureVoiceExists(scriptId: string, voiceOptions: CreateStoryUseCaseRequest['voiceOptions']) {
    let voice = await this.voicesRepository.findByScriptId(scriptId);

    if (!voice) {
      console.log('No voice found, generating...');
      const { voice: newVoice } = await this.createVoiceUseCase.execute({
        scriptId,
        options: voiceOptions || {} // Default options if none provided
      });
      voice = newVoice;
    }

    return voice;
  }

  private async ensureImagesExist(scriptId: string, style: Style) {
    let images = await this.imagesRepository.findByScriptId(scriptId);

    if (images.length === 0) {
      console.log('No images found, generating...');
      const { images: newImages } = await this.createImageUseCase.execute({
        scriptId,
        style
      });
      images = newImages;
    }

    return images;
  }

  private async waitForAssets(scriptId: string, maxAttempts = 60, intervalMs = 2000): Promise<{
    voice: { audio_url: string; status: RequestStatus } | null;
    images: Array<{ image_url: string | null; status: RequestStatus; scene_index: number | null }>;
    music: { audio_url: string; status: RequestStatus } | null;
  }> {
    let attempts = 0;

    while (attempts < maxAttempts) {
      const voice = await this.voicesRepository.findByScriptId(scriptId);
      const images = await this.imagesRepository.findByScriptId(scriptId);
      const music = await this.musicsRepository.findByScriptId(scriptId);

      const voiceReady = voice?.status === 'COMPLETED' && voice.audio_url;
      const imagesReady = images.length > 0 &&
        images.every(img => img.status === 'COMPLETED' && img.image_url);
      const musicReady = music?.status === 'COMPLETED' && music.audio_url;

      if (voiceReady && imagesReady && musicReady) {
        return {
          voice: voice.audio_url ? {
            audio_url: voice.audio_url,
            status: voice.status
          } : null,
          images,
          music: music.audio_url ? {
            audio_url: music.audio_url,
            status: music.status
          } : null
        };
      }

      // Check for failures
      if (voice?.status === 'FAILED' ||
        images.some(img => img.status === 'FAILED') ||
        music?.status === 'FAILED') {
        const errors = [];
        if (voice?.status === 'FAILED') errors.push(`Voice failed: ${voice.error}`);
        if (music?.status === 'FAILED') errors.push(`Music failed: ${music.error}`);
        images.filter(img => img.status === 'FAILED')
          .forEach(img => errors.push(`Image ${img.scene_index} failed: ${img.error}`));

        throw new Error(`Asset generation failed: ${errors.join(', ')}`);
      }

      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }

    throw new Error('Timeout waiting for assets');
  }

  async execute({
    scriptId,
    style,
    musicMood,
    voiceOptions
  }: CreateStoryUseCaseRequest): Promise<{ story: Story }> {
    const script = await this.scriptsRepository.findById(scriptId);

    if (!script) {
      throw new ScriptNotFoundError();
    }

    const analysis = script.analysis as AnalysisResponse;

    // Start asset generation if needed
    const [voice, images] = await Promise.all([
      this.ensureVoiceExists(scriptId, voiceOptions),
      this.ensureImagesExist(scriptId, style)
    ]);

    // Create initial story record
    const story = await this.storiesRepository.create({
      script: { connect: { id: scriptId } },
      user: { connect: { id: script.user_id } },
      style,
      music_mood: musicMood,
      status: 'PENDING',
      image_urls: images.map(img => img.image_url)
    });

    // Start waiting for assets in the background
    this.waitForAssets(scriptId)
      .then(async ({ voice, images }) => {
        if (!voice?.audio_url) {
          throw new Error('Voice generation failed or missing audio URL');
        }

        const sortedImages = [...images].sort((a, b) =>
          (a.scene_index ?? 0) - (b.scene_index ?? 0)
        );

        // Add video generation job to queue
        await this.storyQueue.add('generate-story', {
          storyId: story.id,
          scriptId,
          voiceUrl: voice.audio_url,
          imageUrls: sortedImages.map(img => img.image_url!),
          style,
          musicMood,
          scenes: analysis.scenes
        }, {
          attempts: 2,
          backoff: {
            type: 'exponential',
            delay: 2000
          }
        });

        await this.storiesRepository.updateStatus(story.id, 'PROCESSING');
      })
      .catch(async (error) => {
        console.error('Error waiting for assets:', error);
        await this.storiesRepository.updateStatus(story.id, 'FAILED', {
          error: error.message
        });
      });

    return { story };
  }
}