import type { VideoComposition, VideoGenerationResult } from "./types";

export interface VideoGenerationProvider {
  generate(composition: VideoComposition): Promise<VideoGenerationResult>;
}