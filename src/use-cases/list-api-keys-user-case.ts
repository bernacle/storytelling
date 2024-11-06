import type { ApiKeysRepository } from "@/repositories/api-keys-repository";
import type { ApiKey } from "@prisma/client";

interface ListApiKeysUseCaseRequest {
  userId: string
}

interface ListApiKeysUseCaseResponse {
  apiKeys: ApiKey[]
}

export class ListApiKeysUseCase {
  constructor(private readonly apiKeysRepository: ApiKeysRepository) { }

  async execute({ userId }: ListApiKeysUseCaseRequest): Promise<ListApiKeysUseCaseResponse> {
    const apiKeys = await this.apiKeysRepository.findManyByUserId(userId)
    return { apiKeys }
  }
}