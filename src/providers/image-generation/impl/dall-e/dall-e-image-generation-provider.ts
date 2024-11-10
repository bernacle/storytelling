import OpenAI from 'openai';
import type { ImageGenerationProvider } from '../image-generation-provider';
import type { ImageGenerationOptions, ImageGenerationResult } from '../types';

export class DallEProvider implements ImageGenerationProvider {
  constructor(private readonly openai: OpenAI) { }

  async generate({ prompt, size = '1024x1024' }: ImageGenerationOptions): Promise<ImageGenerationResult> {
    try {

      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt,
        size: size,
        quality: "standard",
        n: 1,
      });

      if (!response.data[0]?.url) {
        throw new Error('No image URL returned from DALL-E')
      }

      return {
        imageUrl: response.data[0].url
      }
    } catch (error) {
      console.error('DALL-E image generation error:', error)
      throw error
    }
  }
}