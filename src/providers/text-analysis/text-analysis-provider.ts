import type { AnalysisRequest, AnalysisResponse } from "./types";

export interface TextAnalysisProvider {
  analyze(request: AnalysisRequest): Promise<AnalysisResponse>
}