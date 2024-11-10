import { env } from "@/env";
import type { VoiceGenerationProvider } from '../../voice-generation-provider';
import type { VoiceGenerationOptions } from '../../types';
import { accentVoiceMapping } from "./accent-voice-mapper";

export class DeepgramVoiceProvider implements VoiceGenerationProvider {
  constructor() {
    if (!env.DEEPGRAM_API_KEY) {
      throw new Error('Deepgram API key not configured');
    }
  }

  private getVoiceId(accent?: string, gender?: string): string {
    const mappedAccent = accent || 'en-US';
    const mappedGender = gender || 'male';

    return accentVoiceMapping[mappedAccent]?.[mappedGender] || 'aura-orion-en';
  }

  async generate(text: string, voiceOptions: VoiceGenerationOptions) {
    const voiceId = this.getVoiceId(voiceOptions.options.accent, voiceOptions.options.gender);


    const endpoint = new URL(env.DEEPGRAM_URL);
    endpoint.searchParams.append("model", voiceId);


    try {
      console.log(`Generating TTS with Deepgram:`, { text, voiceId });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${env.DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text,
        })
      });

      if (!response.ok) {
        const responseText = await response.text();
        console.error(`Deepgram API Error:`, {
          status: response.status,
          headers: Array.from(response.headers.entries()),
          body: responseText
        });
        throw new Error(`Deepgram API error: ${responseText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');

      console.log('Deepgram TTS generation successful');
      return {
        audioUrl: `data:audio/wav;base64,${base64Audio}`
      };
    } catch (error) {
      console.error('Deepgram TTS generation error:', error);
      throw error instanceof Error ? error : new Error(`Unknown error: ${error}`);
    }
  }
}
