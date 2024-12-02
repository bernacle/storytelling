export type ImageGenerationOptions = {
  prompt: string;
  style?: 'realistic' | 'cartoon' | 'minimalistic';
  orientation?: 'vertical' | 'horizontal';
  includeText?: boolean;
}

export type ImageGenerationResult = {
  imageUrl: string;
}


