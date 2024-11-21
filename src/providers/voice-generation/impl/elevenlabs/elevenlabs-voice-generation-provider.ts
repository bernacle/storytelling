import { env } from "process";
import type { VoiceGenerationOptions, VoiceGenerationResult } from "../../types";
import type { VoiceGenerationProvider } from "../../voice-generation-provider";
import { emotionToVoiceSettings, voiceMapping, type ElevenLabsVoiceSettings } from "./emotion-mapper";

export class ElevenLabsProvider implements VoiceGenerationProvider {
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    if (!env.ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }
  }

  private getVoiceId(accent?: string, gender?: string): string {
    const mappedAccent = accent || 'en-US';
    const mappedGender = gender || 'male';
    // Try to get voice for specific accent
    const accentVoice = voiceMapping[mappedAccent]?.[mappedGender];
    if (accentVoice) return accentVoice;
    // Fall back to default voices if accent not found
    return voiceMapping['default'][mappedGender];
  }

  private getVoiceSettings(tone?: string): ElevenLabsVoiceSettings {
    const defaultSettings: ElevenLabsVoiceSettings = {
      stability: 0.7,
      similarity_boost: 0.5,
      style: 0.5,
      use_speaker_boost: true
    };
    if (!tone) return defaultSettings;
    const emotionSettings = emotionToVoiceSettings[tone.toLowerCase()] || emotionToVoiceSettings.neutral;
    return {
      ...defaultSettings,
      ...emotionSettings
    };
  }

  async generate(text: string, voiceOptions: VoiceGenerationOptions): Promise<VoiceGenerationResult> {
    const voiceId = this.getVoiceId(voiceOptions.options.accent, voiceOptions.options.gender);
    const voiceSettings = this.getVoiceSettings(voiceOptions.tone);

    try {
      console.log(`Generating TTS with ElevenLabs:`, { text, voiceId, voiceSettings });

      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': env.ELEVENLABS_API_KEY as string
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: voiceSettings,
          output_format: 'mp3_44100_128'  // explicitly specify MP3 format
        })
      });

      console.log('ElevenLabs response:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        status: response.status
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`ElevenLabs API Error:`, {
          status: response.status,
          headers: Array.from(response.headers.entries()),
          body: errorText
        });
        throw new Error(`ElevenLabs API error: ${errorText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');

      // Ensure we're adding the correct MIME type prefix
      const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

      console.log('ElevenLabs TTS generation successful:', {
        audioUrlPrefix: audioUrl.substring(0, 50), // Log the start of the URL
        contentLength: audioBuffer.byteLength
      });

      return {
        audioUrl
      };
    } catch (error) {
      console.error('ElevenLabs TTS generation error:', error);
      throw error instanceof Error ? error : new Error(`Unknown error: ${error}`);
    }
  }
}