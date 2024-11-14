import { prisma } from '@/lib/prisma';
import type { Prisma, RequestStatus, Story } from '@prisma/client';
import type { StoriesRepository } from '../stories-repository';

export class PrismaStoriesRepository implements StoriesRepository {
  async findById(id: string): Promise<Story | null> {
    console.log('Finding story by ID:', id);
    const story = await prisma.story.findUnique({
      where: { id }
    });
    console.log('Story found:', !!story);
    return story;
  }

  async create(data: Prisma.StoryCreateInput): Promise<Story> {
    console.log('Creating new story');
    const story = await prisma.story.create({
      data
    });
    console.log('Story created with ID:', story.id);
    return story;
  }

  async update(id: string, data: Prisma.StoryUpdateInput): Promise<Story> {
    console.log('Updating story:', id, 'with data:', JSON.stringify(data));
    try {
      const story = await prisma.story.update({
        where: { id },
        data
      });
      console.log('Story updated successfully:', story.id);
      return story;
    } catch (error) {
      console.error('Failed to update story:', {
        storyId: id,
        error
      });
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: RequestStatus,
    data?: Prisma.StoryUpdateInput
  ): Promise<Story> {
    console.log('Updating story status:', {
      storyId: id,
      status,
      additionalData: data
    });

    try {
      const story = await prisma.story.update({
        where: { id },
        data: {
          status,
          ...data
        }
      });
      console.log('Story status updated successfully:', story.id);
      return story;
    } catch (error) {
      console.error('Failed to update story status:', {
        storyId: id,
        status,
        error
      });
      throw error;
    }
  }
}