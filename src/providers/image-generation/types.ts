export type ImageGenerationOptions = {
  prompt: string;
  style?: 'realistic' | 'cartoon' | 'minimalistic';
  orientation?: 'vertical' | 'horizontal';
}

export type ImageGenerationResult = {
  imageUrl: string;
}


