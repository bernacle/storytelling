export type VideoComposition = {
  audio: {
    url: string;
    type: string;
  };
  scenes: Array<{
    image: string;
    duration: number;
    transition: string;
    transitionDuration: number;
  }>;
  style: string;
  music: {
    mood: string;
    volume: number;
  };
}

export type VideoGenerationResult = {
  videoUrl: string;
}
