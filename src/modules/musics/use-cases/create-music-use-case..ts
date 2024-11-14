import type { ScriptsRepository } from "@/modules/scripts/repositories/scripts-repository";
import { ScriptNotFoundError } from "@/modules/scripts/use-cases/errors/script-not-found-error";
import type { AnalysisResponse } from '@/providers/text-analysis';
import type { Music, MusicMood } from "@prisma/client";
import type { Queue } from "bullmq";
import type { MusicsRepository } from "../repositories/musics-repository";
import { createMusicMood, extractEmotions } from "./helpers/emotion-to-music-mapper";

type CreateMusicUseCaseRequest = {
  scriptId: string;
  userId: string;
  musicMood?: MusicMood;
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

  async execute({ scriptId, musicMood, userId }: CreateMusicUseCaseRequest): Promise<CreateMusicUseCaseResponse> {
    const script = await this.scriptsRepository.findById(scriptId);

    if (!script) {
      throw new ScriptNotFoundError();
    }

    const analysis = script.analysis as AnalysisResponse;

    const emotions = extractEmotions(analysis);
    const mood = musicMood ?? createMusicMood(
      emotions,
      analysis.mood || 'neutral',
      analysis.tone || 'neutral'
    );

    const music = await this.musicsRepository.create({
      mood,
      status: 'PENDING',
      script: { connect: { id: scriptId } },
      user: { connect: { id: userId } }
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
