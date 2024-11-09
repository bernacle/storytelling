import type { ScriptsRepository } from '@/modules/scripts/repositories/scripts-repository';
import { Image } from '@prisma/client'
import type { ImagesRepository } from '../repositories/images-repository';
import type { Queue } from 'bullmq';
import { ScriptNotFoundError } from '@/modules/scripts/use-cases/errors/script-not-found-error';
import type { AnalysisResponse } from '@/providers/text-analysis';
import { createVisualPrompt } from './helpers/emotion-to-visual-mapper';


type CreateImageUseCaseRequest = {
  scriptId: string;
  prompt: string;
  style: 'REALISTIC' | 'CARTOON' | 'MINIMALISTIC';
}

type CreateImageUseCaseResponse = {
  image: Image;
}

export class CreateImageUseCase {
  constructor(
    private readonly scriptsRepository: ScriptsRepository,
    private readonly imagesRepository: ImagesRepository,
    private imageQueue: Queue,
  ) { }

  async execute({ scriptId, style }: CreateImageUseCaseRequest): Promise<CreateImageUseCaseResponse> {
    const script = await this.scriptsRepository.findById(scriptId)

    if (!script) {
      throw new ScriptNotFoundError()
    }

    const analysis = script.analysis as AnalysisResponse
    const prompt = this.createPromptFromScript(script.content, analysis, style)


    const image = await this.imagesRepository.create({
      prompt,
      style,
      status: 'PENDING',
      script: { connect: { id: scriptId } },
      user: { connect: { id: script.user_id } },
    })

    await this.imageQueue.add(
      'generate-image',
      {
        imageId: image.id,
        scriptId,
        imageOptions: {
          prompt,
          style
        }
      },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      }
    )

    return { image }
  }

  private createPromptFromScript(
    content: string,
    analysis: AnalysisResponse,
    style: 'REALISTIC' | 'CARTOON' | 'MINIMALISTIC',
    sceneIndex?: number
  ): string {
    if (sceneIndex !== undefined && analysis.scenes[sceneIndex]) {
      const scene = analysis.scenes[sceneIndex];
      return createVisualPrompt(
        scene.text,
        scene.emotion,
        analysis.mood,
        style
      );
    }

    const dominantEmotion = analysis.emotions.reduce((prev, current) =>
      current.intensity > prev.intensity ? current : prev
    );

    return createVisualPrompt(
      content,
      dominantEmotion.name,
      analysis.mood,
      style
    );
  }
}