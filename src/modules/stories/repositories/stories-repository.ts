import { Story, type Prisma, type RequestStatus } from '@prisma/client'

export interface StoriesRepository {
  findById(id: string): Promise<Story | null>
  create(data: Prisma.StoryCreateInput): Promise<Story>
  updateStatus(id: string,
    status: RequestStatus,
    data?: Prisma.StoryUpdateInput): Promise<Story>
}