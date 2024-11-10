export type VoicePreference = {
  gender?: 'male' | 'female';
  accent?: 'american' | 'british' | 'australian' | 'indian' | 'irish';
  ageGroup?: 'youth' | 'adult' | 'senior';
  style?: 'narrative' | 'advertising' | 'gaming';
}


export type VoiceGenerationOptions = {
  options: VoicePreference;
  tone?: string;
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