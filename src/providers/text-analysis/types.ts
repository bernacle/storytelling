export type BaseAnalysisResponse = {
  emotions: Array<{ name: string; intensity: number }>;
  themes: string[];
  tone: string;
  mood: string;
};

export type AnalysisResponse = BaseAnalysisResponse & {
  scenes: Array<{ text: string; emotion: string }>;
};

export type CardAnalysisResponse = BaseAnalysisResponse & {
  designSuggestions: {
    colorPalette: string[];
    fontStyle: string;
    layout: string;
  };
};

export type AnalysisRequest = {
  content: string;
};
