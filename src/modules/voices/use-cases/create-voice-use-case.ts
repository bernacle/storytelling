import { Queue } from 'bullmq'
import type { VoicesRepository } from '../repositories/voices-repository';
import type { ScriptsRepository } from '@/modules/scripts/repositories/scripts-repository';
import type { Voice } from '@prisma/client';
import type { AnalysisResponse } from '@/providers/text-analysis';
import { ScriptNotFoundError } from '@/modules/scripts/use-cases/errors/script-not-found-error';

export type VoiceOptions = {
  gender?: 'male' | 'female';
  accent?: 'american' | 'british' | 'australian' | 'indian' | 'irish';
  ageGroup?: 'youth' | 'adult' | 'senior';
  style?: 'narrative' | 'advertising' | 'gaming';
}

type CreateVoiceUseCaseRequest = {
  scriptId: string,
  options: VoiceOptions
}

type CreateVoiceUseCaseResponse = {
  voice: Voice
}

export class CreateVoiceUseCase {
  constructor(private readonly scriptsRepository: ScriptsRepository, private readonly voicesRepository: VoicesRepository, private voiceQueue: Queue) { }

  async execute({ scriptId, options }: CreateVoiceUseCaseRequest): Promise<CreateVoiceUseCaseResponse> {
    const script = await this.scriptsRepository.findById(scriptId)

    if (!script) {
      throw new ScriptNotFoundError()
    }

    const analysis = script.analysis as AnalysisResponse
    const tone = analysis.tone || 'neutral'

    const voice = await this.voicesRepository.create({
      script: { connect: { id: scriptId } },
      user: { connect: { id: script.user_id } },
      status: 'PENDING',
      tone
    })


    await this.voiceQueue.add('generate-voice', {
      voiceId: voice.id,
      scriptId,
      voiceOptions: {
        options,
        tone,
      }
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    })

    return { voice }
  }
}