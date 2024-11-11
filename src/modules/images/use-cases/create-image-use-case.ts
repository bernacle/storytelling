import type { ScriptsRepository } from '@/modules/scripts/repositories/scripts-repository';
import { Image, Prisma, type Script } from '@prisma/client'
import type { ImagesRepository } from '../repositories/images-repository';
import type { Queue } from 'bullmq';
import { ScriptNotFoundError } from '@/modules/scripts/use-cases/errors/script-not-found-error';
import type { AnalysisResponse } from '@/providers/text-analysis';
import { createVisualPrompt } from './helpers/emotion-to-visual-mapper';
import { ScenesNotFoundInScriptError } from '@/modules/scripts/use-cases/errors/scenes-not-found-in-script-error';

type CreateImageUseCaseRequest = {
  scriptId: string;
  style: 'REALISTIC' | 'CARTOON' | 'MINIMALISTIC';
}

type CreateImageUseCaseResponse = {
  images: Image[];
}

export class CreateImageUseCase {
  constructor(
    private readonly scriptsRepository: ScriptsRepository,
    private readonly imagesRepository: ImagesRepository,
    private imageQueue: Queue,
  ) { }

  private async processScene(
    scene: AnalysisResponse['scenes'][0],
    sceneIndex: number,
    analysis: AnalysisResponse,
    scriptId: string,
    userId: string,
    style: CreateImageUseCaseRequest['style'],
    existingImage?: Image
  ): Promise<Image> {
    const prompt = createVisualPrompt(
      scene.text,
      scene.emotion,
      analysis.mood,
      style
    );

    try {
      let image: Image;

      if (existingImage) {
        if (existingImage.style === style && existingImage.status === 'COMPLETED') {
          return existingImage;
        }

        image = await this.imagesRepository.save({
          ...existingImage,
          prompt,
          style,
          status: 'PENDING',
          image_url: null,
          error: null,
        });
      } else {
        image = await this.imagesRepository.create({
          prompt,
          style,
          status: 'PENDING',
          scene_index: sceneIndex,
          script: { connect: { id: scriptId } },
          user: { connect: { id: userId } },
        });
      }

      await this.imageQueue.add(
        'generate-image',
        {
          imageId: image.id,
          scriptId,
          sceneIndex,
          imageOptions: {
            prompt,
            style: style.toLowerCase(),
          }
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        }
      );

      return image;
    } catch (error) {
      console.error(`Error processing scene ${sceneIndex}:`, error);

      return this.imagesRepository.create({
        prompt,
        style,
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error',
        scene_index: sceneIndex,
        script: { connect: { id: scriptId } },
        user: { connect: { id: userId } },
      });
    }
  }

  async execute({ scriptId, style }: CreateImageUseCaseRequest): Promise<CreateImageUseCaseResponse> {
    try {
      const script = await this.scriptsRepository.findById(scriptId);

      if (!script) {
        throw new ScriptNotFoundError();
      }

      const analysis = script.analysis as AnalysisResponse;

      if (!analysis.scenes || analysis.scenes.length === 0) {
        throw new ScenesNotFoundInScriptError();
      }

      const existingImages = await this.imagesRepository.findByScriptId(scriptId);
      const existingImagesByIndex = new Map(
        existingImages.map(img => [img.scene_index, img])
      );

      const imagePromises = analysis.scenes.map((scene, sceneIndex) =>
        this.processScene(
          scene,
          sceneIndex,
          analysis,
          script.id,
          script.user_id,
          style,
          existingImagesByIndex.get(sceneIndex)
        )
      );

      const images = await Promise.allSettled(imagePromises);

      return {
        images: images
          .filter((result): result is PromiseFulfilledResult<Image> => result.status === 'fulfilled')
          .map(result => result.value)
      };
    } catch (error) {
      console.error('Error in CreateImageUseCase:', error);
      throw error;
    }
  }
}