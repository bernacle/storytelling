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
  private readonly config: Omit<HuggingFaceConfig, 'apiToken' | 'modelId'>;

  constructor(config: HuggingFaceConfig) {
    this.apiToken = config.apiToken;
    this.modelId = config.modelId ?? DEFAULT_MODEL.MODEL_ID;

    this.config = {
      duration: config.duration ?? 30,
      temperature: config.temperature ?? 1,
      topK: config.topK ?? 250,
      topP: config.topP ?? 0,
      guidanceScale: config.guidanceScale ?? 3,
    };
  }

  private getMoodPrompt(mood: MusicMood): string {
    const moodPrompts = {
      'UPBEAT': 'Create an upbeat and energetic background music with a positive vibe, suitable for storytelling. Modern electronic pop style, inspiring and motivational.',
      'DRAMATIC': 'Create a dramatic and emotional background music with cinematic feel, suitable for storytelling. Orchestral elements with building tension and resolution.',
      'CALM': 'Create a calm and soothing background music with peaceful atmosphere, suitable for storytelling. Soft ambient sounds with gentle melody.'
    };

    return moodPrompts[mood];
  }

  async generate(mood: MusicMood, durationSeconds: number): Promise<{ audioUrl: string }> {
    try {
      const prompt = this.getMoodPrompt(mood);

      const response = await fetch(`${this.baseUrl}/${this.modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            duration: durationSeconds,
            temperature: this.config.temperature,
            top_k: this.config.topK,
            top_p: this.config.topP,
            guidance_scale: this.config.guidanceScale,
          }
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HuggingFace API error: ${error}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const base64Audio = Buffer.from(audioBuffer).toString('base64');
      const audioUrl = `data:audio/wav;base64,${base64Audio}`;

      return { audioUrl };
    } catch (error) {
      console.error('HuggingFace music generation error:', error);
      throw error;
    }
  }

  async checkModelStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.modelId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      const result = await response.json();
      return !result.error;
    } catch {
      return false;
    }
  }
}