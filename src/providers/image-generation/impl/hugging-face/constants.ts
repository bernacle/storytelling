export const HUGGINGFACE_MODELS = {
  SDXL: {
    MODEL_ID: "stabilityai/stable-diffusion-xl-base-1.0",
    DESCRIPTION: "Stable Diffusion XL - High quality image generation"
  },
  SD_TURBO: {
    MODEL_ID: "stabilityai/sd-turbo",
    DESCRIPTION: "Stable Diffusion Turbo - Faster generation with good quality"
  },
  PLAYGROUND: {
    MODEL_ID: "playgroundai/playground-v2-1024px-aesthetic",
    DESCRIPTION: "Playground v2 - Aesthetic focused model"
  },
  ANYTHING_V5: {
    MODEL_ID: "stablediffusionapi/anything-v5",
    DESCRIPTION: "Anything V5 - Versatile model good for anime and illustrations"
  }
} as const;

export const DEFAULT_MODEL = HUGGINGFACE_MODELS.SDXL;