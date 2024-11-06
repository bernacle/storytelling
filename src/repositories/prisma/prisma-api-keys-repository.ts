import type { ApiKey, Prisma } from "@prisma/client";
import type { ApiKeysRepository } from "../api-keys-repository";
import { prisma } from "@/lib/prisma";

export class PrismaApiKeysRepository implements ApiKeysRepository {
  async findManyByUserId(userId: string): Promise<ApiKey[]> {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        user_id: userId
      }
    })

    return apiKeys
  }
  async create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey> {
    const apiKey = await prisma.apiKey.create({
      data
    })

    return apiKey
  }
  async revoke(id: string): Promise<ApiKey> {
    const apiKey = await prisma.apiKey.update({
      where: {
        id
      },
      data: {
        status: "REVOKED"
      }
    })

    return apiKey
  }

}