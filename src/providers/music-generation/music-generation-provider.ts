import type { MusicMood } from "@prisma/client";

export interface MusicGenerationProvider {
  generate(mood: MusicMood, durationSeconds: number): Promise<{ audioUrl: string }>;
}
