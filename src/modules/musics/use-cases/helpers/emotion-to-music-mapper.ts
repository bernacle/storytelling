import type { AnalysisResponse } from '@/providers/text-analysis';
import type { MusicMood } from '@prisma/client';

export type EmotionIntensity = {
  emotion: string;
  intensity: number;
};

export function createMusicMood(
  emotions: EmotionIntensity[],
  mood: string,
  tone: string
): MusicMood {
  // Normalize inputs to lowercase
  const normalizedMood = mood.toLowerCase();
  const normalizedTone = tone.toLowerCase();

  // Define emotion mappings to music moods
  const upbeatEmotions = new Set([
    'joy', 'happy', 'excited', 'energetic', 'cheerful',
    'optimistic', 'playful', 'enthusiastic', 'triumphant'
  ]);

  const dramaticEmotions = new Set([
    'anger', 'sad', 'fear', 'tense', 'anxious',
    'mysterious', 'dramatic', 'melancholic', 'intense',
    'passionate', 'powerful', 'dark'
  ]);

  const calmEmotions = new Set([
    'calm', 'peaceful', 'serene', 'gentle', 'tender',
    'relaxed', 'tranquil', 'neutral', 'soothing',
    'nostalgic', 'contemplative'
  ]);

  // Helper function to count emotion matches
  function countEmotionMatches(emotions: EmotionIntensity[], targetSet: Set<string>): number {
    return emotions.reduce((count, { emotion, intensity }) => {
      if (targetSet.has(emotion.toLowerCase())) {
        return count + intensity;
      }
      return count;
    }, 0);
  }

  // Calculate scores for each mood
  const scores = {
    UPBEAT: countEmotionMatches(emotions, upbeatEmotions),
    DRAMATIC: countEmotionMatches(emotions, dramaticEmotions),
    CALM: countEmotionMatches(emotions, calmEmotions)
  };

  // Add weight from overall mood and tone
  if (upbeatEmotions.has(normalizedMood)) scores.UPBEAT += 1;
  if (dramaticEmotions.has(normalizedMood)) scores.DRAMATIC += 1;
  if (calmEmotions.has(normalizedMood)) scores.CALM += 1;

  if (upbeatEmotions.has(normalizedTone)) scores.UPBEAT += 0.5;
  if (dramaticEmotions.has(normalizedTone)) scores.DRAMATIC += 0.5;
  if (calmEmotions.has(normalizedTone)) scores.CALM += 0.5;

  // Find the mood with highest score
  const entries = Object.entries(scores) as [MusicMood, number][];
  const [highestMood] = entries.reduce((max, current) => {
    return current[1] > max[1] ? current : max;
  });

  return highestMood;
}

export function extractEmotions(analysis: AnalysisResponse): EmotionIntensity[] {
  // Create a map to track emotion frequencies
  const emotionMap = new Map<string, number>();

  // Count emotions from each scene
  analysis.scenes.forEach(scene => {
    if (scene.emotion) {
      const emotion = scene.emotion.toLowerCase();
      emotionMap.set(emotion, (emotionMap.get(emotion) || 0) + 1);
    }
  });

  // Convert to array of EmotionIntensity
  const emotions: EmotionIntensity[] = Array.from(emotionMap.entries()).map(([emotion, count]) => ({
    emotion,
    intensity: count
  }));

  // Normalize intensities to be between 0 and 1
  const totalCount = emotions.reduce((sum, e) => sum + e.intensity, 0);
  emotions.forEach(e => {
    e.intensity = e.intensity / totalCount;
  });

  return emotions;
}