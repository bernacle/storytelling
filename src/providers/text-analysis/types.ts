
export type AnalysisResponse = {
  emotions: Array<{ name: string; intensity: number }>
  themes: string[]
  tone: string
  mood: string
  suggestedMusic: string
  scenes: Array<{ text: string; emotion: string }>
  modifiedScript?: string
}

export type AnalysisRequest = {
  content: string
}