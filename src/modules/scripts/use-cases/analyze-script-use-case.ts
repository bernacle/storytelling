import type { TextAnalysisProvider } from "@/providers/text-analysis";
import type { ScriptsRepository } from "@/modules/scripts/repositories/scripts-repository";
import type { Script } from "@prisma/client";

type AnalyzeScriptUseCaseRequest = {
  content: string
  targetEmotion?: string
  userId: string
}

type AnalyzeScriptUseCaseResponse = {
  script: Script
}

export class AnalyzeScriptUseCase {
  constructor(private readonly scriptsRepository: ScriptsRepository, private readonly textAnalysisProvider: TextAnalysisProvider) { }

  async execute({ content, targetEmotion, userId }: AnalyzeScriptUseCaseRequest): Promise<AnalyzeScriptUseCaseResponse> {
    const analysis = await this.textAnalysisProvider.analyze({ content, targetEmotion })
    const script = await this.scriptsRepository.create({
      content, analysis, user: {
        connect: { id: userId }
      }
    })
    return { script }
  }
}