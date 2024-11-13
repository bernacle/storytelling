import type { Music, Prisma } from "@prisma/client";

export interface MusicsRepository {
  create(data: Prisma.MusicCreateInput): Promise<Music>;
  findById(id: string): Promise<Music | null>;
  findByStoryId(storyId: string): Promise<Music | null>;
  updateStatus(
    id: string,
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
    data?: Prisma.MusicUpdateInput
  ): Promise<Music>;
}