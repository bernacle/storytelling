import { Image, type Prisma } from '@prisma/client'

export interface ImagesRepository {
  create(data: Prisma.ImageCreateInput): Promise<Image>
  findById(id: string): Promise<Image | null>
  findByScriptId(scriptId: string): Promise<Image[]>
  save(data: Image): Promise<Image>
  updateStatus(id: string, status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED', data?: Partial<Image>): Promise<Image>
}