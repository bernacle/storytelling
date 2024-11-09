import type { ScriptsRepository } from '@/modules/scripts/repositories/scripts-repository';
import { Image } from '@prisma/client'
import type { ImagesRepository } from '../repositories/images-repository';
import type { Queue } from 'bullmq';
import { ScriptNotFoundError } from '@/modules/scripts/use-cases/errors/script-not-found-error';


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

  async execute({ scriptId, prompt, style }: CreateImageUseCaseRequest): Promise<CreateImageUseCaseResponse> {
    const script = await this.scriptsRepository.findById(scriptId)

    if (!script) {
      throw new ScriptNotFoundError()
    }

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
}