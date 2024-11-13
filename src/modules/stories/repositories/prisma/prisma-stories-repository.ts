import type { User, Prisma, Story, RequestStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { StoriesRepository } from "../stories-repository";

export class PrismaStoriesRepository implements StoriesRepository {
  async findById(id: string): Promise<Story | null> {
    const story = await prisma.story.findUnique({
      where: {
        id
      }
    })

    return story
  }


  async create(data: Prisma.StoryCreateInput): Promise<Story> {
    const story = await prisma.story.create({
      data
    })

    return story
  }

  async updateStatus(
    id: string,
    status: RequestStatus,
    data?: Prisma.StoryUpdateInput
  ): Promise<Story> {
    return await prisma.story.update({
      where: { id },
      data: {
        status,
        ...data
      }
    });
  }

}