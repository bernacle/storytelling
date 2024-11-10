import type { VoiceGenerationProvider } from '../voice-generation-provider';
import { env } from '@/env';
import { PlayHTProvider } from '../impl/playht/playht-voice-generation-provider';
import { DeepgramVoiceProvider } from '../impl/deepgram/deepgram-voice-generation-provider';

export type VoiceProviderType = 'deepgram' | 'playht'

export type VoiceProviderConfig = {
  provider?: VoiceProviderType;
}

export class VoiceProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VoiceProviderError';
  }
}

export function makeVoiceProvider(config?: VoiceProviderConfig): VoiceGenerationProvider {
  switch (config?.provider) {
    case 'deepgram':
      return new DeepgramVoiceProvider();

    case 'playht':
      return new PlayHTProvider();

    default:
      throw new VoiceProviderError(`Unsupported provider: ${config?.provider}`);
  }
}