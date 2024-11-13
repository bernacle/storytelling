import type { MusicMood } from "@prisma/client";
import { env } from "process";
import type { MusicGenerationProvider } from "../music-generation-provider";
import { DEFAULT_MODEL } from "./constants";


type HuggingFaceConfig = {
  apiToken: string;
  modelId?: string;
  duration?: number;
  temperature?: number;
  topK?: number;
  topP?: number;
  guidanceScale?: number;
}

export class HuggingFaceMusicProvider implements MusicGenerationProvider {
  private readonly apiToken: string;
  private readonly modelId: string;
  private readonly baseUrl = env.HUGGINGFACE_API_URL;

  constructor(config: { apiToken: string; modelId?: string }) {
    this.apiToken = config.apiToken;
    this.modelId = DEFAULT_MODEL.MODEL_ID;
  }

  private getMoodPrompt(mood: MusicMood): string {
    const moodPrompts = {
      'UPBEAT': 'An upbeat and energetic electronic pop music with a positive vibe. The melody is catchy and inspiring.',
      'DRAMATIC': 'A dramatic orchestral piece with deep emotions and building tension. The music is powerful and intense.',
      'CALM': 'A calm and peaceful ambient music with soft melodies and gentle sounds. The atmosphere is soothing and relaxing.'
    };

    return moodPrompts[mood];
  }

  async generate(mood: MusicMood): Promise<{ audioUrl: string }> {
    try {
      const prompt = this.getMoodPrompt(mood);

      console.log('Generating music with prompt:', prompt);

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
      console.error('Music generation error:', error);
      throw error;
    }
  }
}
