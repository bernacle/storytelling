import { ApiKey, type Prisma } from '@prisma/client'


export interface ApiKeysRepository {
  findManyByUserId(userId: string): Promise<ApiKey[]>
  findById(id: string, userId: string): Promise<ApiKey | null>
  create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey>
  revoke(id: string, userId: string): Promise<ApiKey>
}