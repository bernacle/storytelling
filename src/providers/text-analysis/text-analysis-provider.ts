import type { AnalysisRequest, AnalysisResponse, CardAnalysisResponse } from "./types";

export interface TextAnalysisProvider {
  analyzeStory(request: AnalysisRequest): Promise<AnalysisResponse>
  analyzeCard(request: AnalysisRequest): Promise<CardAnalysisResponse>
}