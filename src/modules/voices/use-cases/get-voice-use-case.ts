import { Queue } from 'bullmq'
import type { VoicesRepository } from '../repositories/voices-repository';
import type { ScriptsRepository } from '@/modules/scripts/repositories/scripts-repository';
import type { Voice } from '@prisma/client';
import { VoiceNotFoundError } from './errors/voice-not-found-error';

type GetVoiceUseCaseRequest = {
  id: string,
}

type GetVoiceUseCaseResponse = {
  voice: Voice
}



export class GetVoiceUseCase {
  constructor(private readonly voicesRepository: VoicesRepository) { }

  async execute({ id }: GetVoiceUseCaseRequest): Promise<GetVoiceUseCaseResponse> {
    const voice = await this.voicesRepository.findById(id)

    if (!voice) {
      throw new VoiceNotFoundError()
    }

    return { voice }
  }
}