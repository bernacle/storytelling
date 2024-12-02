import type { ScriptsRepository } from "@/modules/scripts/repositories/scripts-repository";
import type { TextAnalysisProvider } from "@/providers/text-analysis";
import type { Script } from "@prisma/client";

type AnalyzeScriptUseCaseRequest = {
  content: string
  type: 'STORY' | 'CARD';
  userId: string
}

type AnalyzeScriptUseCaseResponse = {
  script: Script
}

export class AnalyzeScriptUseCase {
  constructor(private readonly scriptsRepository: ScriptsRepository, private readonly textAnalysisProvider: TextAnalysisProvider) { }

  async execute({ content, userId, type }: AnalyzeScriptUseCaseRequest): Promise<AnalyzeScriptUseCaseResponse> {
    const analysis =
      type === 'STORY'
        ? await this.textAnalysisProvider.analyzeStory({ content })
        : await this.textAnalysisProvider.analyzeCard({ content });

    const script = await this.scriptsRepository.create({
      content, type, analysis, user: {
        connect: { id: userId }
      }
    })
    return { script }
  }
}