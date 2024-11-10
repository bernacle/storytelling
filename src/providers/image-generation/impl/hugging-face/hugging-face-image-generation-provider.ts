import { env } from "@/env";
import type { ImageGenerationProvider } from "../../image-generation-provider";
import type { ImageGenerationOptions, ImageGenerationResult } from "../../types";
import { DEFAULT_MODEL } from "./constants";

interface HuggingFaceConfig {
  apiToken: string;
  modelId?: string;
  numInferenceSteps?: number;
  guidanceScale?: number;
  negativePrompt?: string;
}

export class HuggingFaceProvider implements ImageGenerationProvider {
  private readonly apiToken: string;
  private readonly modelId: string;
  private readonly baseUrl = env.HUGGINGFACE_API_URL
  private readonly config: Omit<HuggingFaceConfig, 'apiToken' | 'modelId'>;

  constructor(config: HuggingFaceConfig) {
    this.apiToken = config.apiToken;
    this.modelId = config.modelId ?? DEFAULT_MODEL.MODEL_ID;

    this.config = {
      numInferenceSteps: config.numInferenceSteps ?? 30,
      guidanceScale: config.guidanceScale ?? 7.5,
      negativePrompt: config.negativePrompt ?? 'ugly, blurry, poor quality, duplicate, mutated, deformed'
    };
  }

  async generate({ prompt, size = '1024x1024' }: ImageGenerationOptions): Promise<ImageGenerationResult> {
    try {
      const [width, height] = size.split('x').map(Number);

      const response = await fetch(`${this.baseUrl}/${this.modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: this.config.negativePrompt,
            num_inference_steps: this.config.numInferenceSteps,
            guidance_scale: this.config.guidanceScale,
            width,
            height,
          }
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HuggingFace API error: ${error}`);
      }

      const imageBuffer = await response.arrayBuffer();

      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      return { imageUrl };
    } catch (error) {
      console.error('HuggingFace image generation error:', error);
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