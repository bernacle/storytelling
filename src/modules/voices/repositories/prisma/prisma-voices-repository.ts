import { PrismaClient, type Prisma, type Voice } from '@prisma/client'
import { VoicesRepository } from '../voices-repository'
import { prisma } from '@/lib/prisma'

export class PrismaVoicesRepository implements VoicesRepository {
  async findById(id: string) {
    return await prisma.voice.findUnique({
      where: { id }
    })
  }

  async create(data: Prisma.VoiceCreateInput) {
    return await prisma.voice.create({
      data
    })
  }

  async updateStatus(id: string, status: 'PROCESSING' | 'COMPLETED' | 'FAILED', data?: Partial<Voice>) {
    return await prisma.voice.update({
      where: { id },
      data: {
        status,
        ...data
      }
    })
  }
}