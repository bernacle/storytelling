import type { ImageGenerationProvider } from '../image-generation-provider';
import OpenAI from 'openai';
import { DallEProvider } from '../impl/dall-e/dall-e-image-generation-provider';
import { HuggingFaceProvider } from '../impl/hugging-face/hugging-face-image-generation-provider';
import { HUGGINGFACE_MODELS } from '../impl/hugging-face/constants';
import { env } from '@/env';

export type ImageProviderType = 'replicate' | 'dalle' | 'huggingface';

export type ImageProviderConfig = {
  provider?: ImageProviderType;
  apiKey?: string;
  modelVersion?: string;
  numInferenceSteps?: number;
  guidanceScale?: number;
  negativePrompt?: string;
}

export class ImageProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageProviderError';
  }
}

export function makeImageProvider(config?: ImageProviderConfig): ImageGenerationProvider {

  const commonConfig = {
    numInferenceSteps: config?.numInferenceSteps,
    guidanceScale: config?.guidanceScale,
    negativePrompt: config?.negativePrompt,
  };



  switch (config?.provider) {
    case 'huggingface':
      return new HuggingFaceProvider({
        apiToken: env.HUGGINGFACE_API_TOKEN as string,
        modelId: HUGGINGFACE_MODELS.SDXL.MODEL_ID,
        ...commonConfig
      });

    case 'dalle':
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      return new DallEProvider(openai);

    default:
      throw new ImageProviderError(`Unsupported provider: ${config?.provider}`);
  }
}

