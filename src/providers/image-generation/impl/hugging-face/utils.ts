import { HUGGINGFACE_MODELS, VIDEO_FORMATS } from './constants';

export const getBestModelForSize = (size: string) => {
  switch (size) {
    case VIDEO_FORMATS.vertical:
      return {
        ...HUGGINGFACE_MODELS.SDXL,
        DEFAULT_STEPS: 1,
        DEFAULT_GUIDANCE: 7.0
      };
    case VIDEO_FORMATS.horizontal:
      return {
        ...HUGGINGFACE_MODELS.SDXL,
        DEFAULT_STEPS: 30,
        DEFAULT_GUIDANCE: 7.5
      };
    default:
      return {
        ...HUGGINGFACE_MODELS.SDXL,
        DEFAULT_STEPS: 30,
        DEFAULT_GUIDANCE: 7.5
      };
  }
};