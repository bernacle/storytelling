import { EmotionConfig } from '../types'

export const EMOTION_CONFIGS: Record<string, EmotionConfig> = {
  surprise: {
    prefix: '',
    suffix: '...',
    pauseLength: 2,
    fillerWords: ['wow', 'oh', 'whoa']
  },
  confusion: {
    prefix: '',
    suffix: '...',
    pauseLength: 2,
    fillerWords: ['uh', 'hmm', 'well']
  },
  fear: {
    prefix: '',
    suffix: '...',
    pauseLength: 2,
    fillerWords: ['I... I', 'oh no', 'please']
  },
  anger: {
    prefix: '',
    suffix: '...',
    pauseLength: 2,
    fillerWords: ['no', 'but', 'why']
  },
  sadness: {
    prefix: '',
    suffix: '...',
    pauseLength: 2,
    fillerWords: ['oh', 'but', 'why']
  },
  joy: {
    prefix: '',
    suffix: '!',
    pauseLength: 1,
    fillerWords: ['yes', 'oh', 'amazing']
  },
  neutral: {
    prefix: '',
    suffix: '',
    pauseLength: 1,
    fillerWords: ['well', 'so', 'now']
  }
}