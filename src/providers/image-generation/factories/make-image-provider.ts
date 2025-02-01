import { env } from "@/env";
import type { ImageGenerationProvider } from "../image-generation-provider";
import { HuggingFaceProvider } from "../impl/hugging-face/hugging-face-image-generation-provider";

export type ImageProviderType = "replicate" | "dalle" | "huggingface";

export type ImageProviderConfig = {
  provider?: ImageProviderType;
  apiKey?: string;
};

export class ImageProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageProviderError";
  }
}

export function makeImageProvider(
  config?: ImageProviderConfig
): ImageGenerationProvider {
  switch (config?.provider) {
    case "huggingface":
      return new HuggingFaceProvider({
        apiToken: env.HUGGINGFACE_API_TOKEN as string,
      });

    default:
      throw new ImageProviderError(`Unsupported provider: ${config?.provider}`);
  }
}
