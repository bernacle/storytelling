import type { ApiKeysRepository } from "@/modules/api-keys/repositories/api-keys-repository";
import type { ApiKey } from "@prisma/client";

interface RevokeApiKeyUseCaseRequest {
  id: string
}

interface RevokeApiKeyUseCaseResponse {
  apiKey: ApiKey
}

export class RevokeApiKeyUseCase {
  constructor(private readonly apiKeysRepository: ApiKeysRepository) { }

  async execute({ id }: RevokeApiKeyUseCaseRequest): Promise<RevokeApiKeyUseCaseResponse> {
    const apiKey = await this.apiKeysRepository.revoke(id)
    return { apiKey }
  }
}