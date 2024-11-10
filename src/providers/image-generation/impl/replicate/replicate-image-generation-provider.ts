import type { ImageGenerationProvider } from '../image-generation-provider';
import type { ImageGenerationOptions, ImageGenerationResult } from '../types';

interface ReplicatePrediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed';
  output: string[] | null;
  error?: string;
}

interface ReplicateConfig {
  apiToken: string;
  modelVersion?: string;
}

export class ReplicateProvider implements ImageGenerationProvider {
  private readonly apiToken: string;
  private readonly modelVersion: string;
  private readonly baseUrl = 'https://api.replicate.com/v1';

  constructor(config: ReplicateConfig) {
    this.apiToken = config.apiToken;
    // Default to SDXL if no model version specified
    this.modelVersion = config.modelVersion ?? '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
  }

  async generate({ prompt, size = '1024x1024' }: ImageGenerationOptions): Promise<ImageGenerationResult> {
    try {
      // Parse size string (e.g., "1024x1024" -> { width: 1024, height: 1024 })
      const [width, height] = size.split('x').map(Number);

      // Create prediction
      const prediction = await this.createPrediction(prompt, width, height);

      // Poll for results
      const result = await this.pollPrediction(prediction.id);

      if (result.status === 'failed' || !result.output?.[0]) {
        throw new Error(result.error || 'No image URL returned from Replicate');
      }

      return {
        imageUrl: result.output[0]
      };
    } catch (error) {
      console.error('Replicate image generation error:', error);
      throw error;
    }
  }

  private async createPrediction(prompt: string, width: number, height: number): Promise<ReplicatePrediction> {
    const response = await fetch(`${this.baseUrl}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: this.modelVersion,
        input: {
          prompt,
          width,
          height,
          num_outputs: 1,
          scheduler: 'K_EULER',
          num_inference_steps: 50,
          guidance_scale: 7.5,
          negative_prompt: 'ugly, blurry, poor quality',
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    return response.json();
  }

  private async pollPrediction(predictionId: string): Promise<ReplicatePrediction> {
    const maxAttempts = 60; // Maximum polling attempts (60 * 1s = 60 seconds timeout)
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Replicate API error: ${response.statusText}`);
      }

      const prediction: ReplicatePrediction = await response.json();

      if (prediction.status === 'succeeded' || prediction.status === 'failed') {
        return prediction;
      }

      // Wait 1 second before next attempt
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Prediction timeout');
  }
}