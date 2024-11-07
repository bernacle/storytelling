import { Voice, type Prisma } from '@prisma/client'

export interface VoicesRepository {
  findById(id: string): Promise<Voice | null>
  create(data: Prisma.VoiceCreateInput): Promise<Voice>
  updateStatus(id: string, status: 'PROCESSING' | 'COMPLETED' | 'FAILED', data?: Partial<Voice>): Promise<Voice>
}