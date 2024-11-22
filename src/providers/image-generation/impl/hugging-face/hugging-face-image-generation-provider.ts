import { env } from "@/env";
import type { ImageGenerationProvider } from "../../image-generation-provider";
import type { ImageGenerationOptions, ImageGenerationResult } from "../../types";
import { DEFAULT_MODEL, VIDEO_FORMATS } from "./constants";

type HuggingFaceConfig = {
  apiToken: string;
  modelId?: string;
  numInferenceSteps?: number;
  guidanceScale?: number;
  negativePrompt?: string;
  samplingMethod?: string;
  modelRevision?: string;
  safetyChecker?: boolean;
}

export class HuggingFaceProvider implements ImageGenerationProvider {
  private readonly apiToken: string;
  private readonly modelId: string;
  private readonly baseUrl = env.HUGGINGFACE_API_URL
  private readonly config: Omit<HuggingFaceConfig, 'apiToken' | 'modelId'>;

  constructor(config: HuggingFaceConfig) {
    this.apiToken = config.apiToken;
    this.modelId = config.modelId ?? DEFAULT_MODEL.MODEL_ID;

    this.config = {
      numInferenceSteps: config.numInferenceSteps ?? 30,
      guidanceScale: config.guidanceScale ?? 7.5,
      negativePrompt: config.negativePrompt ?? [
        "ugly", "blurry", "poor quality", "duplicate", "mutated", "deformed",
        "bad anatomy", "extra limbs", "poorly drawn face", "mutation", "malformed",
        "out of frame", "extra fingers", "mutated hands", "poorly drawn hands",
        "fused fingers", "too many fingers", "multiple heads", "extra arms",
        "extra legs", "distorted", "disfigured", "gross proportions",
        "missing arms", "missing legs", "double heads", "multiple faces",
        "amateur drawing", "bad proportions", "floating limbs", "disconnected limbs",
        "asymmetric eyes", "misaligned eyes", "crossed eyes", "watermark",
        "signature", "text", "logo", "low quality", "pixelated"
      ].join(", "),
      samplingMethod: config.samplingMethod ?? "DPM++ 2M Karras",
      safetyChecker: config.safetyChecker ?? true
    };
  }

  private enhancePrompt(prompt: string, orientation: 'vertical' | 'horizontal'): string {
    const qualityModifiers = [
      "masterpiece",
      "high quality",
      "detailed",
      "professional",
      "sharp focus",
      "high resolution",
      "well-composed",
      "professionally photographed"
    ];

    const compositionModifiers = orientation === 'vertical' ? [
      "portrait composition",
      "vertical framing",
      "centered composition"
    ] : [
      "landscape composition",
      "horizontal framing",
      "rule of thirds"
    ];

    const technicalModifiers = [
      "8k resolution",
      "detailed lighting",
      "professional lighting",
      "high detail"
    ];

    return [
      prompt,
      "(",
      [...qualityModifiers, ...compositionModifiers, ...technicalModifiers].join(", "),
      ")"
    ].join(" ");
  }


  async generate({ prompt, orientation = 'vertical' }: ImageGenerationOptions): Promise<ImageGenerationResult> {
    try {
      const [width, height] = VIDEO_FORMATS[orientation].split('x').map(Number);

      const enhancedPrompt = this.enhancePrompt(prompt, orientation);

      const response = await fetch(`${this.baseUrl}/${this.modelId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            negative_prompt: this.config.negativePrompt,
            num_inference_steps: this.config.numInferenceSteps,
            guidance_scale: this.config.guidanceScale,
            width,
            height,
            sampler: this.config.samplingMethod,
            safety_checker: this.config.safetyChecker,
            clip_skip: 2, // Skip CLIP text encoding layers for better results
            seed: Math.floor(Math.random() * 2147483647), // Random seed for variety
            tiling: false, // Prevent tiling artifacts
            restore_faces: true, // Improve face generation
          }
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`HuggingFace API error: ${error}`);
      }

      const imageBuffer = await response.arrayBuffer();

      const base64Image = Buffer.from(imageBuffer).toString('base64');
      const imageUrl = `data:image/jpeg;base64,${base64Image}`;

      return { imageUrl };
    } catch (error) {
      console.error('HuggingFace image generation error:', error);
      throw error;
    }
  }

  async checkModelStatus(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/${this.modelId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      const result = await response.json();
      return !result.error;
    } catch {
      return false;
    }
  }
}