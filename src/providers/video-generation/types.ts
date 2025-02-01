export type VideoComposition = {
  audio: {
    url: string; // base64 string
    type: string;
  };
  scenes: Scene[];
  content: string;
  style: string;
};

export type Scene = {
  image: string; // base64 string
  duration: number;
  transition: string;
  transitionDuration: number;
  text: string;
};

export type VideoGenerationResult = {
  videoUrl: string;
};
