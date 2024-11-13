import { prisma } from "@/lib/prisma";

import type { Music, Prisma } from "@prisma/client";
import type { MusicsRepository } from "../musics-repository";

export class PrismaMusicsRepository implements MusicsRepository {
  async findById(id: string): Promise<Music | null> {
    return await prisma.music.findUnique({
      where: { id }
    });
  }

  async findByStoryId(storyId: string): Promise<Music | null> {
    return await prisma.music.findFirst({
      where: { story_id: storyId }
    });
  }

  async create(data: Prisma.MusicCreateInput): Promise<Music> {
    return await prisma.music.create({ data });
  }

  async updateStatus(
    id: string,
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
    data?: Prisma.MusicUpdateInput
  ): Promise<Music> {
    return await prisma.music.update({
      where: { id },
      data: {
        status,
        ...data,
        updated_at: new Date()
      }
    });
  }
}
