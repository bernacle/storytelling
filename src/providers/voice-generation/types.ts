export type VoiceGenerationOptions = {
  voiceId: string;
  tone?: string;
  speed?: number;
}

export type VoiceGenerationResult = {
  audioUrl: string;
}