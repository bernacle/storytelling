import type { ImagesRepository } from "@/modules/images/repositories/images-repository";
import type { CreateImageUseCase } from "@/modules/images/use-cases/create-image-use-case";
import type { ScriptsRepository } from "@/modules/scripts/repositories/scripts-repository";
import { ScriptNotFoundError } from "@/modules/scripts/use-cases/errors/script-not-found-error";
import type { VoicesRepository } from "@/modules/voices/repositories/voices-repository";
import type { CreateVoiceUseCase } from "@/modules/voices/use-cases/create-voice-use-case";
import type { AnalysisResponse } from "@/providers/text-analysis";
import { AssetWaitHandler } from "@/workers/handlers/asset-wait-handler";
import type { Story, Style } from "@prisma/client";
import type { Queue } from "bullmq";
import type { StoriesRepository } from "../repositories/stories-repository";

type CreateStoryUseCaseRequest = {
  scriptId: string;
  style: Style;
  voiceOptions?: {
    gender?: "male" | "female";
    accent?: "american" | "british" | "australian" | "indian" | "irish";
    ageGroup?: "youth" | "adult" | "senior";
    style?: "narrative" | "advertising" | "gaming";
  };
};

export class CreateStoryUseCase {
  constructor(
    private readonly scriptsRepository: ScriptsRepository,
    private readonly voicesRepository: VoicesRepository,
    private readonly imagesRepository: ImagesRepository,
    private readonly storiesRepository: StoriesRepository,
    private readonly createVoiceUseCase: CreateVoiceUseCase,
    private readonly createImageUseCase: CreateImageUseCase,
    private readonly storyQueue: Queue
  ) {}

  private async ensureVoiceExists(
    scriptId: string,
    voiceOptions: CreateStoryUseCaseRequest["voiceOptions"]
  ) {
    const voice = await this.voicesRepository.findByScriptId(scriptId);

    if (!voice) {
      console.log("No voice found, generating...");
      const { voice: newVoice } = await this.createVoiceUseCase.execute({
        scriptId,
        options: voiceOptions || {},
      });
      return newVoice;
    }

    return voice;
  }

  private async ensureImagesExist(scriptId: string, style: Style) {
    const images = await this.imagesRepository.findByScriptId(scriptId);

    if (images.length === 0) {
      console.log("No images found, generating...");
      const { images: newImages } = await this.createImageUseCase.execute({
        scriptId,
        style,
      });
      return newImages;
    }

    return images;
  }

  async execute({
    scriptId,
    style,
    voiceOptions,
  }: CreateStoryUseCaseRequest): Promise<{ story: Story }> {
    console.log("Starting story creation for script:", scriptId);

    const script = await this.scriptsRepository.findById(scriptId);
    if (!script) {
      throw new ScriptNotFoundError();
    }

    console.log("Found script, creating initial story record");

    // Create initial story record
    const story = await this.storiesRepository.create({
      script: { connect: { id: scriptId } },
      user: { connect: { id: script.user_id } },
      style,
      status: "PENDING",
      image_urls: [],
    });

    console.log("Created story with ID:", story.id);

    const analysis = script.analysis as AnalysisResponse;

    try {
      console.log("Starting asset generation for story:", story.id);

      // Start asset generation
      const [voice, images] = await Promise.all([
        this.ensureVoiceExists(scriptId, voiceOptions),
        this.ensureImagesExist(scriptId, style),
      ]);

      console.log("Initial assets generated:", {
        hasVoice: !!voice,
        imageCount: images.length,
      });

      // Update story with initial image URLs
      await this.storiesRepository.update(story.id, {
        image_urls: images
          .map((img) => img.image_url)
          .filter((url): url is string => url !== null),
      });

      console.log("Updated story with initial image URLs");

      // Create a new AssetWaitHandler
      const assetWaitHandler = new AssetWaitHandler(
        {
          voicesRepository: this.voicesRepository,
          imagesRepository: this.imagesRepository,
        },
        {
          maxAttempts: 300,
          initialIntervalMs: 2000,
          maxIntervalMs: 30000,
          exponentialBase: 1.5,
        }
      );

      // Wait for assets and queue video generation
      assetWaitHandler
        .waitForAssets(scriptId)
        .then(async ({ voice, images }) => {
          console.log("Assets ready for story:", story.id);

          if (!voice?.audio_url) {
            throw new Error("Voice generation failed or missing audio URL");
          }

          const sortedImages = [...images].sort(
            (a, b) => (a.scene_index ?? 0) - (b.scene_index ?? 0)
          );

          console.log("Queueing video generation for story:", story.id);

          await this.storyQueue.add(
            "generate-story",
            {
              storyId: story.id,
              scriptId,
              voiceUrl: voice.audio_url,
              imageUrls: sortedImages
                .map((img) => img.image_url)
                .filter((url): url is string => url !== null),
              style,
              scenes: analysis.scenes,
              content: script.content,
            },
            {
              attempts: 3,
              backoff: {
                type: "exponential",
                delay: 5000,
              },
            }
          );

          console.log("Story status updating to PROCESSING:", story.id);
          await this.storiesRepository.updateStatus(story.id, "PROCESSING");
          console.log("Story status updated successfully:", story.id);
        })
        .catch(async (error: Error) => {
          console.error("Error waiting for assets for story:", {
            storyId: story.id,
            error: error.message,
            stack: error.stack,
          });

          console.log("Updating story status to FAILED:", story.id);
          try {
            await this.storiesRepository.updateStatus(story.id, "FAILED", {
              error: error.message,
            });
            console.log(
              "Story status updated to FAILED successfully:",
              story.id
            );
          } catch (updateError) {
            console.error("Failed to update story status:", {
              storyId: story.id,
              error: updateError,
            });
          }
        });

      return { story };
    } catch (error) {
      console.error("Error in story creation:", {
        storyId: story.id,
        error,
      });
      throw error;
    }
  }
}
