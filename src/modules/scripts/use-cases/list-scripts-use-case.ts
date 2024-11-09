import type { ScriptsRepository } from "@/modules/scripts/repositories/scripts-repository";
import type { Script } from "@prisma/client";

interface ListScriptsUseCaseRequest {
  userId: string
}

interface ListScriptsUseCaseResponse {
  scripts: Script[]
}

export class ListScriptsUseCase {
  constructor(private readonly scriptsRepository: ScriptsRepository) { }

  async execute({ userId }: ListScriptsUseCaseRequest): Promise<ListScriptsUseCaseResponse> {
    const scripts = await this.scriptsRepository.findManyByUserId(userId)
    return { scripts }
  }
}