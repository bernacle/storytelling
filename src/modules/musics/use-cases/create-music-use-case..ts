import type { MusicsRepository } from "../repositories/musics-repository";
import type { ScriptsRepository } from "@/modules/scripts/repositories/scripts-repository";
import type { Queue } from "bullmq";
import type { Music, MusicMood } from "@prisma/client";
import type { AnalysisResponse } from '@/providers/text-analysis';
import { ScriptNotFoundError } from "@/modules/scripts/use-cases/errors/script-not-found-error";
import { createMusicMood, extractEmotions, type EmotionIntensity } from "./helpers/emotion-to-music-mapper";

type CreateMusicUseCaseRequest = {
  scriptId: string;
}

type CreateMusicUseCaseResponse = {
  music: Music;
}

export class CreateMusicUseCase {
  constructor(
    private readonly scriptsRepository: ScriptsRepository,
    private readonly musicsRepository: MusicsRepository,
    private readonly musicQueue: Queue
  ) { }

  async execute({ scriptId }: CreateMusicUseCaseRequest): Promise<CreateMusicUseCaseResponse> {
    const script = await this.scriptsRepository.findById(scriptId);

    if (!script) {
      throw new ScriptNotFoundError();
    }

    const analysis = script.analysis as AnalysisResponse;

    // Extract emotions and determine music mood
    const emotions = extractEmotions(analysis);
    const mood = createMusicMood(
      emotions,
      analysis.mood || 'neutral',
      analysis.tone || 'neutral'
    );

    // Create music record
    const music = await this.musicsRepository.create({
      mood,
      status: 'PENDING',
      script: { connect: { id: scriptId } },
      user: { connect: { id: script.user_id } }
    });

    await this.musicQueue.add('generate-music', {
      musicId: music.id,
      scriptId,
      mood,
      emotions
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });

    return { music };
  }
}
