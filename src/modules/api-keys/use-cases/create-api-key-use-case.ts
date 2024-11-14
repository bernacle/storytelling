import { generateApiKey } from "@/helpers/generate-api-key";
import type { ApiKeysRepository } from "@/modules/api-keys/repositories/api-keys-repository";
import type { ApiKey } from "@prisma/client";

type CreateApiKeyUseCaseRequest = {
  userId: string
  label: string
}

type CreateApiKeyUseCaseResponse = {
  apiKey: ApiKey
}

export class CreateApiKeyUseCase {
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