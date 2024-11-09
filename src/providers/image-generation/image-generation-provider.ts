import type { ImageGenerationOptions, ImageGenerationResult } from "./types";

export interface ImageGenerationProvider {
  generate(options: ImageGenerationOptions): Promise<ImageGenerationResult>;
}