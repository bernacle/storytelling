import { Story, type Prisma } from '@prisma/client'

export interface StorysRepository {
  findById(id: string): Promise<Story | null>
  create(data: Prisma.StoryCreateInput): Promise<Story>
}