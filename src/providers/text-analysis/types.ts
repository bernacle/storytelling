
export type AnalysisResponse = {
  emotions: Array<{ name: string; intensity: number }>
  themes: string[]
  tone: string
  mood: string
  suggestedMusic: string
  scenes: Array<{ text: string; emotion: string }>
  modifiedScript?: string
}

export interface AnalysisRequest {
  content: string
  targetEmotion?: string
}