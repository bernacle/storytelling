import type { ApiKey, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ApiKeysRepository } from "../api-keys-repository";

export class PrismaApiKeysRepository implements ApiKeysRepository {
  async findManyByUserId(userId: string): Promise<ApiKey[]> {
    const apiKeys = await prisma.apiKey.findMany({
      where: {
        user_id: userId
      }
    })

    return apiKeys
  }

  async findById(id: string, userId: string): Promise<ApiKey | null> {
    const apiKey = await prisma.apiKey.findUnique({
      where: {
        id: id,
        user_id: userId,
        status: "ACTIVE"
      }
    })

    return apiKey
  }

  async create(data: Prisma.ApiKeyCreateInput): Promise<ApiKey> {
    const apiKey = await prisma.apiKey.create({
      data
    })

    return apiKey
  }
  async revoke(id: string, userId: string): Promise<ApiKey> {
    const apiKey = await prisma.apiKey.update({
      where: {
        id,
        user_id: userId
      },
      data: {
        status: "REVOKED"
      }
    })

    return apiKey
  }

}