import type { MusicMood } from "@prisma/client";
import { env } from "process";
import type { MusicGenerationProvider } from "../music-generation-provider";
import type { MusicGenerationOptions } from "../types";
import { DEFAULT_MODEL } from "./constants";

export class HuggingFaceMusicProvider implements MusicGenerationProvider {
  private readonly apiToken: string;
  private readonly modelId: string;
  private readonly baseUrl = env.HUGGINGFACE_API_URL;

  constructor(config: { apiToken: string; modelId?: string }) {
    this.apiToken = config.apiToken;
    this.modelId = config.modelId || DEFAULT_MODEL.MODEL_ID;
  }

  private getMoodPrompt(mood: MusicMood, emotions: string[]): string {
    const moodPrompts: Record<MusicMood, string> = {
      'UPBEAT': 'An upbeat and energetic electronic pop music with a positive vibe. The melody is catchy and inspiring.',
      'DRAMATIC': 'A dramatic orchestral piece with deep emotions and building tension. The music is powerful and intense.',
      'CALM': 'A calm and peaceful ambient music with soft melodies and gentle sounds. The atmosphere is soothing and relaxing.'
    };

    const basePrompt = moodPrompts[mood];
    const emotionsText = emotions.length > 0
      ? ` The music conveys emotions of ${emotions.join(', ')}.`
      : '';

    return basePrompt + emotionsText;
  }

  async generate(options: MusicGenerationOptions): Promise<{ audioUrl: string }> {
    const { mood, emotions, duration } = options;

    try {
      const prompt = this.getMoodPrompt(mood, emotions);
      console.log('Generating music with options:', {
        mood,
        emotionsCount: emotions.length,
        duration,
        prompt
      });

      const response = await fetch(`${this.baseUrl}/${this.modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('HuggingFace API error response:', error);
        throw new Error(`HuggingFace API error: ${error}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;

      return { audioUrl };
    } catch (error) {
      console.error('Music generation error:', {
        error,
        mood,
        emotionsCount: emotions.length,
        duration
      });
      throw error;
    }
  }
}