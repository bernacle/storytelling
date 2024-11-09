import type { ApiKeysRepository } from "@/modules/api-keys/repositories/api-keys-repository";
import type { ApiKey } from "@prisma/client";

type ListApiKeysUseCaseRequest = {
  userId: string
}

type ListApiKeysUseCaseResponse = {
  apiKeys: ApiKey[]
}

export class ListApiKeysUseCase {
  constructor(private readonly apiKeysRepository: ApiKeysRepository) { }

  async execute({ userId }: ListApiKeysUseCaseRequest): Promise<ListApiKeysUseCaseResponse> {
    const apiKeys = await this.apiKeysRepository.findManyByUserId(userId)
    return { apiKeys }
  }
}