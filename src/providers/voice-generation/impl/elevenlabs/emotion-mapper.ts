export type ElevenLabsVoiceSettings = {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}



export const emotionToVoiceSettings: Record<string, Partial<ElevenLabsVoiceSettings>> = {

  joy: { stability: 0.7, similarity_boost: 0.7, style: 0.7 },
  happiness: { stability: 0.7, similarity_boost: 0.7, style: 0.7 },
  delight: { stability: 0.7, similarity_boost: 0.7, style: 0.8 },
  enthusiastic: { stability: 0.6, similarity_boost: 0.8, style: 0.9 },


  sadness: { stability: 0.9, similarity_boost: 0.5, style: 0.3 },
  melancholy: { stability: 0.9, similarity_boost: 0.5, style: 0.2 },
  grief: { stability: 1.0, similarity_boost: 0.4, style: 0.1 },


  anger: { stability: 0.4, similarity_boost: 0.8, style: 0.9 },
  rage: { stability: 0.3, similarity_boost: 0.9, style: 1.0 },
  frustration: { stability: 0.5, similarity_boost: 0.7, style: 0.8 },


  fear: { stability: 0.5, similarity_boost: 0.6, style: 0.7 },
  anxiety: { stability: 0.4, similarity_boost: 0.7, style: 0.8 },


  neutral: { stability: 0.7, similarity_boost: 0.5, style: 0.5 }
};


export const voiceMapping: Record<string, Record<string, string>> = {
  'en-US': {
    male: '21m00Tcm4TlvDq8ikWAM', // Adam
    female: 'EXAVITQu4vr4xnSDxMaL'  // Rachel
  },
  'en-GB': {
    male: 'pNInz6obpgDQGcFmaJgB',   // Harry
    female: 'ThT5KcBeYPX3keUQqHPh'  // Dorothy
  },
  // Default to some popular voices
  'default': {
    male: '21m00Tcm4TlvDq8ikWAM',   // Adam
    female: 'EXAVITQu4vr4xnSDxMaL'  // Rachel
  }
};