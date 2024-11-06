import { generateApiKey } from "@/helpers/generate-api-key";
import type { ApiKeysRepository } from "@/repositories/api-keys-repository";
import type { ApiKey } from "@prisma/client";

interface CreateApiKeyUseCaseRequest {
  userId: string
  label: string
}

interface CreateApiKeyUseCaseResponse {
  apiKey: ApiKey
}

export class CreateUserUseCase {
  constructor(private readonly apiKeysRepository: ApiKeysRepository) { }

  async execute({ label, userId }: CreateApiKeyUseCaseRequest): Promise<CreateApiKeyUseCaseResponse> {

    const apiKeySecret = generateApiKey()

    const apiKey = await this.apiKeysRepository.create({
      api_key: apiKeySecret,
      label,
      status: 'ACTIVE',
      user: {
        connect: {
          id: userId
        }
      }
    })
    return { apiKey }
  }
}