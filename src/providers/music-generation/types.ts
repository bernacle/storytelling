import type { MusicMood } from "@prisma/client";

export type MusicGenerationOptions = {
  mood: MusicMood;
  emotions: string[];
  duration: number; // in seconds
}

export type MusicGenerationResult = {
  audioUrl: string;
}