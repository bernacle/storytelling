import type { ApiKeysRepository } from "@/modules/api-keys/repositories/api-keys-repository";
import type { ApiKey } from "@prisma/client";
import { ApiKeyRevoked } from "./errors/api-key-already-revoked-error";

interface RevokeApiKeyUseCaseRequest {
  id: string
  userId: string
}

interface RevokeApiKeyUseCaseResponse {
  apiKey: ApiKey
}

export class RevokeApiKeyUseCase {
  constructor(private readonly apiKeysRepository: ApiKeysRepository) { }

  async execute({ id, userId }: RevokeApiKeyUseCaseRequest): Promise<RevokeApiKeyUseCaseResponse> {


    const apiKeyIsActive = await this.apiKeysRepository.findById(id, userId)

    if (!apiKeyIsActive) {
      throw new ApiKeyRevoked()
    }

    const apiKey = await this.apiKeysRepository.revoke(id, userId)
    return { apiKey }
  }
}