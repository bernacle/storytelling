import type { VoiceGenerationOptions, VoiceGenerationResult } from "./types";

export interface VoiceGenerationProvider {
  generate(text: string, options: VoiceGenerationOptions): Promise<VoiceGenerationResult>
}