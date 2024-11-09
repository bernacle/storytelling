import { Queue } from 'bullmq'
import type { VoicesRepository } from '../repositories/voices-repository';
import type { ScriptsRepository } from '@/modules/scripts/repositories/scripts-repository';
import type { Voice } from '@prisma/client';
import type { AnalysisResponse } from '@/providers/text-analysis';
import { ScriptNotFoundError } from '@/modules/scripts/use-cases/errors/script-not-found-error';

type CreateVoiceUseCaseRequest = {
  scriptId: string,
  voiceId: string,
  toneInput?: string,
  speed?: number,
}

type CreateVoiceUseCaseResponse = {
  voice: Voice
}

export class CreateVoiceUseCase {
  constructor(private readonly scriptsRepository: ScriptsRepository, private readonly voicesRepository: VoicesRepository, private voiceQueue: Queue) { }

  async execute({ scriptId, voiceId, toneInput, speed }: CreateVoiceUseCaseRequest): Promise<CreateVoiceUseCaseResponse> {
    const script = await this.scriptsRepository.findById(scriptId)

    if (!script) {
      throw new ScriptNotFoundError()
    }

    const analysis = script.analysis as AnalysisResponse
    const tone = toneInput || analysis.tone || 'neutral'

    const voice = await this.voicesRepository.create({
      script: { connect: { id: scriptId } },
      user: { connect: { id: script.user_id } },
      voice_type: voiceId,
      status: 'PENDING',
      tone
    })


    await this.voiceQueue.add('generate-voice', {
      voiceId: voice.id,
      scriptId,
      voiceOptions: {
        voiceId,
        tone,
        speed
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