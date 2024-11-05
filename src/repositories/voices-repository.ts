import { Voice, type Prisma } from '@prisma/client'

export interface VoicesRepository {
  findById(id: string): Promise<Voice | null>
  create(data: Prisma.VoiceCreateInput): Promise<Voice>
}