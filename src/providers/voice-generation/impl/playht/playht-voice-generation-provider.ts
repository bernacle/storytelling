import * as PlayHT from 'playht';
import type { VoiceGenerationProvider } from '../../voice-generation-provider';
import type { VoiceGenerationOptions, VoicePreference } from '../../types';
import { mapToPlayHTEmotion } from './emotion-mapper';
import { env } from '@/env';

const accentMapping: Record<string, string> = {
  american: 'en-US',
  british: 'en-GB',
  australian: 'en-AU',
  indian: 'en-IN',
  irish: 'en-IE'
};

export class PlayHTProvider implements VoiceGenerationProvider {
  private cachedVoices: PlayHT.VoiceInfo[] | null = null;

  constructor() {
    if (!env.PLAYHT_API_KEY || !env.PLAYHT_USER_ID) {
      throw new Error('PlayHT credentials not configured');
    }

    PlayHT.init({
      apiKey: env.PLAYHT_API_KEY,
      userId: env.PLAYHT_USER_ID,
    });
  }

  private async getVoices(): Promise<PlayHT.VoiceInfo[]> {
    if (!this.cachedVoices) {
      this.cachedVoices = await PlayHT.listVoices();
    }
    return this.cachedVoices;
  }

  private async findBestVoiceMatch(preference: VoicePreference): Promise<PlayHT.VoiceInfo> {
    const voices = await this.getVoices();

    // Map the accent to PlayHT's languageCode format
    const mappedLanguageCode = preference.accent ? accentMapping[preference.accent] : undefined;

    const matches = voices.filter(voice => {
      if (preference.gender && voice.gender !== preference.gender) return false;
      if (mappedLanguageCode && voice.languageCode !== mappedLanguageCode) return false;
      if (preference.ageGroup && voice.ageGroup !== preference.ageGroup) return false;
      if (preference.style && !voice.styles?.includes(preference.style)) return false;
      return true;
    });

    if (matches.length === 0) {
      const defaults = voices.filter(voice =>
        voice.gender === (preference.gender || 'male') &&
        voice.styles?.includes('narrative')
      );

      if (defaults.length === 0) {
        throw new Error('No matching voice found and no suitable defaults available');
      }

      return defaults[0];
    }

    return matches[0];
  }

  async generate(text: string, voiceOptions: VoiceGenerationOptions) {
    try {
      const selectedVoice = await this.findBestVoiceMatch(voiceOptions.options);

      if (!selectedVoice) {
        throw new Error('Invalid voice ID');
      }

      const emotion = voiceOptions.tone ? mapToPlayHTEmotion(
        voiceOptions.tone,
        selectedVoice.gender as 'male' | 'female'
      ) : undefined;

      const generateOptions: PlayHT.SpeechOptions = {
        voiceId: selectedVoice.id,
        quality: 'high',
        speed: voiceOptions.speed || 1,
        voiceEngine: 'PlayHT2.0',
        ...(emotion ? { emotion } : {}),
      };

      console.log('PlayHT generate options:', generateOptions);

      const generated = await PlayHT.generate(text, generateOptions);

      console.log('PlayHT response:', generated);

      if (!generated || !generated.audioUrl) {
        throw new Error(`Invalid PlayHT response: ${JSON.stringify(generated)}`);
      }

      return {
        audioUrl: generated.audioUrl
      };
    } catch (error) {
      console.error('Raw PlayHT error:', error);

      if (error instanceof Error) {
        throw error;
      }

      if (error && typeof error === 'object') {
        throw new Error(
          `PlayHT API error: ${JSON.stringify(error, null, 2)}`
        );
      }

      throw new Error(`Unknown PlayHT error: ${error}`);
    }
  }
}
