export type ImageGenerationOptions = {
  prompt: string;
  style?: 'realistic' | 'cartoon' | 'minimalistic';
  size?: '1024x1024' | '1792x1024' | '1024x1792';
}

export type ImageGenerationResult = {
  imageUrl: string;
}