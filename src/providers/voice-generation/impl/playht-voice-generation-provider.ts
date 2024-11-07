import * as PlayHT from 'playht';
import type { VoiceGenerationProvider } from '../voice-generation-provider';
import type { VoiceGenerationOptions, VoiceGenerationResult } from '../types';

export class PlayHTProvider implements VoiceGenerationProvider {
  constructor() {
    PlayHT.init({
      apiKey: process.env.PLAYHT_API_KEY!,
      userId: process.env.PLAYHT_USER_ID!,
    });
  }

  async generate(text: string, options: VoiceGenerationOptions): Promise<VoiceGenerationResult> {
    try {
      const generated = await PlayHT.generate(text, {
        voiceId: options.voiceId,
        voiceEngine: 'PlayHT2.0',
        quality: 'high',
        speed: options.speed || 1,
      });

      return {
        audioUrl: generated.audioUrl,
      };
    } catch (error) {
      throw new Error(`PlayHT generation failed: ${error}`);
    }
  }
}
