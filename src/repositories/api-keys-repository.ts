import { ApiKey, type Prisma } from '@prisma/client'

export interface ApiKeysRepository {
  findById(id: string): Promise<ApiKey | null>
  create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey>
}