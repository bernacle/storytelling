import type { VoiceGenerationOptions, VoiceGenerationResult } from "./types";

export interface VoiceGenerationProvider {
  generate(text: string, voiceOptions: VoiceGenerationOptions): Promise<VoiceGenerationResult>
}