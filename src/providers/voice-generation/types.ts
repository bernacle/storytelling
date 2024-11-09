export type VoiceGenerationOptions = {
  voiceId: string;
  tone: string;
  speed?: number;
}


export type VoiceGenerationResult = {
  audioUrl: string;
}


export type Emotion =
  | 'female_happy' | 'female_sad' | 'female_angry'
  | 'female_fearful' | 'female_disgust' | 'female_surprised'
  | 'male_happy' | 'male_sad' | 'male_angry'
  | 'male_fearful' | 'male_disgust' | 'male_surprised';