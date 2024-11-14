export type VideoComposition = {
  audio: {
    url: string; // base64 string
    type: string;
  };
  scenes: Array<{
    image: string; // base64 string
    duration: number;
    transition: string;
    transitionDuration: number;
  }>;
  style: string;
  music: {
    mood: string;
    volume: number;
    url?: string; // Optional for backward compatibility
  };
}

export type VideoGenerationResult = {
  videoUrl: string;
}
