export function mapToCoquiEmotion(scriptEmotion: string): string {
  const emotionMap: Record<string, string> = {
    joy: 'joyfully',
    happiness: 'happily',
    anger: 'angrily',
    sadness: 'sadly',
    surprise: 'surprisingly',
    fear: 'fearfully'
  };

  return emotionMap[scriptEmotion.toLowerCase()] || '';
}