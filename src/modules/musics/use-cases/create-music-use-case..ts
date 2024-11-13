import type { Queue } from "bullmq";
import type { Music, MusicMood } from "@prisma/client";
import type { MusicsRepository } from "../repositories/musics-repository";

interface CreateMusicUseCaseRequest {
  userId: string;
  storyId?: string;
  mood: MusicMood;
  duration: number;
}

interface CreateMusicUseCaseResponse {
  music: Music;
}

export class CreateMusicUseCase {
  constructor(
    private musicsRepository: MusicsRepository,
    private musicQueue: Queue
  ) { }

  async execute({
    userId,
    storyId,
    mood,
    duration
  }: CreateMusicUseCaseRequest): Promise<CreateMusicUseCaseResponse> {
    const music = await this.musicsRepository.create({
      mood,
      duration,
      status: "PENDING",
      user: { connect: { id: userId } },
      ...(storyId && { story: { connect: { id: storyId } } })
    });

    await this.musicQueue.add(
      "generate-music",
      {
        musicId: music.id,
        mood,
        duration
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 1000
        }
      }
    );

    return { music };
  }
}