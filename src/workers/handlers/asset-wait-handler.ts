import type { RequestStatus } from '@prisma/client';

type AssetStatus = {
  status: RequestStatus;
  error?: string | null;
  audio_url?: string | null;
  image_url?: string | null;
  scene_index?: number | null;
}

type ImageAsset = {
  status: RequestStatus;
  image_url: string | null;
  scene_index: number | null;
  error?: string | null;
}

type VoiceAsset = {
  status: RequestStatus;
  audio_url: string | null;
  error?: string | null;
}

type MusicAsset = {
  status: RequestStatus;
  audio_url: string | null;
  error?: string | null;
}

type AssetRepositories = {
  voicesRepository: {
    findByScriptId: (scriptId: string) => Promise<VoiceAsset | null>;
  };
  imagesRepository: {
    findByScriptId: (scriptId: string) => Promise<ImageAsset[]>;
  };
  musicsRepository: {
    findByScriptId: (scriptId: string) => Promise<MusicAsset | null>;
  };
}

type WaitForAssetsConfig = {
  maxAttempts?: number;
  initialIntervalMs?: number;
  maxIntervalMs?: number;
  exponentialBase?: number;
}

type AssetWaitResult = {
  voice: { audio_url: string; status: RequestStatus } | null;
  images: Array<{ image_url: string | null; status: RequestStatus; scene_index: number | null }>;
  music: { audio_url: string; status: RequestStatus } | null;
}

export class AssetWaitHandler {
  private readonly DEFAULT_CONFIG: Required<WaitForAssetsConfig> = {
    maxAttempts: 120,
    initialIntervalMs: 2000,
    maxIntervalMs: 30000,
    exponentialBase: 1.5
  };

  private calculateBackoffInterval(attempt: number): number {
    const { initialIntervalMs, maxIntervalMs, exponentialBase } =
      this.config as Required<WaitForAssetsConfig>;

    const interval = initialIntervalMs * Math.pow(exponentialBase, attempt);
    return Math.min(interval, maxIntervalMs);
  };

  constructor(
    private readonly repositories: AssetRepositories,
    private readonly config: WaitForAssetsConfig = {}
  ) {
    this.config = { ...this.DEFAULT_CONFIG, ...config };
  }

  private isTemporaryError(error: string | null | undefined): boolean {
    if (!error) return false;

    const errorLower = error.toLowerCase();
    return (
      errorLower.includes('model too busy') ||
      errorLower.includes('rate limit') ||
      errorLower.includes('429') ||
      errorLower.includes('max requests') ||
      errorLower.includes('too many requests') ||
      errorLower.includes('unable to get response')
    );
  }

  private async checkAssetStatus(scriptId: string): Promise<{
    voice: VoiceAsset | null;
    images: ImageAsset[];
    music: MusicAsset | null;
    allComplete: boolean;
    hasFailures: boolean;
    errors: string[];
  }> {
    const voice = await this.repositories.voicesRepository.findByScriptId(scriptId);
    const images = await this.repositories.imagesRepository.findByScriptId(scriptId);
    const music = await this.repositories.musicsRepository.findByScriptId(scriptId);

    const errors: string[] = [];

    // Only consider non-temporary failures as actual failures
    if (voice?.status === 'FAILED' && !this.isTemporaryError(voice.error)) {
      errors.push(`Voice failed: ${voice.error}`);
    }
    if (music?.status === 'FAILED' && !this.isTemporaryError(music.error)) {
      errors.push(`Music failed: ${music.error}`);
    }

    const permanentImageFailures = images
      .filter((img): img is ImageAsset & { status: 'FAILED' } =>
        img.status === 'FAILED' && !this.isTemporaryError(img.error)
      );

    permanentImageFailures.forEach(img =>
      errors.push(`Image ${img.scene_index} failed: ${img.error}`)
    );

    // Consider assets complete if they're either COMPLETED or have temporary failures
    // (which the worker will retry)
    const isAssetComplete = (status: RequestStatus | undefined, error: string | null | undefined) =>
      status === 'COMPLETED' || (status === 'FAILED' && this.isTemporaryError(error));

    const allComplete = Boolean(
      (voice ? isAssetComplete(voice.status, voice.error) : true) &&
      (music ? isAssetComplete(music.status, music.error) : true) &&
      images.length > 0 &&
      images.every(img => isAssetComplete(img.status, img.error))
    );

    const hasFailures = errors.length > 0;

    return {
      voice,
      images,
      music,
      allComplete,
      hasFailures,
      errors
    };
  }

  private validateAssets(voice: VoiceAsset | null, images: ImageAsset[], music: MusicAsset | null) {
    const errors: string[] = [];

    if (!voice?.audio_url) {
      errors.push('Voice asset missing audio URL');
    }

    if (images.length === 0) {
      errors.push('No image assets found');
    } else {
      const invalidImages = images.filter(img => !img.image_url);
      if (invalidImages.length > 0) {
        errors.push(`Missing image URLs for scenes: ${invalidImages.map(img => img.scene_index).join(', ')}`);
      }
    }

    if (!music?.audio_url) {
      errors.push('Music asset missing audio URL');
    }

    if (errors.length > 0) {
      throw new Error(`Asset validation failed: ${errors.join('; ')}`);
    }
  }

  async waitForAssets(scriptId: string): Promise<AssetWaitResult> {
    const { maxAttempts } = this.config as Required<WaitForAssetsConfig>;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const {
        voice,
        images,
        music,
        allComplete,
        hasFailures,
        errors
      } = await this.checkAssetStatus(scriptId);

      // Only throw on permanent failures
      if (hasFailures) {
        throw new Error(`Asset generation failed: ${errors.join(', ')}`);
      }

      // If all assets are complete or have temporary failures (which will be retried)
      if (allComplete) {
        this.validateAssets(voice, images, music);

        return {
          voice: voice?.audio_url ? {
            audio_url: voice.audio_url,
            status: voice.status
          } : null,
          images: images.map(img => ({
            image_url: img.image_url ?? null,
            status: img.status,
            scene_index: img.scene_index ?? null
          })),
          music: music?.audio_url ? {
            audio_url: music.audio_url,
            status: music.status
          } : null
        };
      }

      const interval = this.calculateBackoffInterval(attempts);
      await new Promise(resolve => setTimeout(resolve, interval));
      attempts++;

      if (attempts % 10 === 0) {
        console.log(`Still waiting for assets (attempt ${attempts}/${maxAttempts}):`, {
          voiceStatus: voice?.status,
          musicStatus: music?.status,
          imagesComplete: `${images.filter(img =>
            img.status === 'COMPLETED' ||
            (img.status === 'FAILED' && this.isTemporaryError(img.error))
          ).length}/${images.length}`,
          pendingRetries: images.filter(img =>
            img.status === 'FAILED' &&
            this.isTemporaryError(img.error)
          ).length
        });
      }
    }

    throw new Error(`Timeout waiting for assets after ${maxAttempts} attempts`);
  }
}