import type { MusicGenerationOptions, MusicGenerationResult } from "./types";

export interface MusicGenerationProvider {
  generate(options: MusicGenerationOptions): Promise<MusicGenerationResult>;
}