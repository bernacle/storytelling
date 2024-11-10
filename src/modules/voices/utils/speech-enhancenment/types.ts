export type EmotionConfig = {
  prefix?: string
  suffix?: string
  pauseLength?: number
  fillerWords: string[]
}

export type Scene = {
  text: string
  emotion?: string
}

export type AnalysisResponse = {
  scenes?: Scene[]
}