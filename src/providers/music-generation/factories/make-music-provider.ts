import { env } from '@/env';
import { HuggingFaceMusicProvider } from '../impl/hugging-face-music-generation-provider';

export function makeMusicProvider() {
  return new HuggingFaceMusicProvider({
    apiToken: env.HUGGINGFACE_API_TOKEN,
    duration: 30,
    temperature: 1,
    topK: 250,
    guidanceScale: 3
  });
}