import { ApiKey, type Prisma } from '@prisma/client'

export interface ApiKeysRepository {
  findManyByUserId(userId: string): Promise<ApiKey[]>
  create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey>
  revoke(id: string): Promise<ApiKey>
}