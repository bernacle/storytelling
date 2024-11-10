import { EMOTION_CONFIGS } from './configs/emotion-configs'
import type { AnalysisResponse } from './types'

function addNaturalPauses(text: string): string {
  // Add pauses for sentence endings with emotion-appropriate length
  text = text.replace(/\./g, '... ')

  // Add shorter pauses for commas
  text = text.replace(/,/g, ', ')

  // Add pauses for dramatic moments
  text = text.replace(/—/g, '... ')
  text = text.replace(/\.\.\./g, '... ')

  return text
}

function addFillerWords(text: string, emotion: string): string {
  const config = EMOTION_CONFIGS[emotion]
  if (!config || config.fillerWords.length === 0) return text

  const sentences = text.split('. ')
  return sentences.map(sentence => {
    // Add filler words randomly to ~20% of sentences
    if (Math.random() < 0.2 && sentence.length > 0) {
      const fillerWord = config.fillerWords[Math.floor(Math.random() * config.fillerWords.length)]
      // For fear, add more pauses around filler words
      const pauseStyle = emotion === 'fear' ? '... ' : ' '
      return `${fillerWord}${pauseStyle}${sentence}`
    }
    return sentence
  }).join('. ')
}

function addEmotionalCues(text: string, emotion: string): string {
  const config = EMOTION_CONFIGS[emotion]
  if (!config) return text

  let enhancedText = text

  // Add subtle emotional suffixes
  if (config.suffix && Math.random() < 0.3) {
    enhancedText = enhancedText + config.suffix
  }

  // Add pauses based on emotion intensity, more for fear
  const pauseCount = emotion === 'fear' ? (config.pauseLength || 1) + 1 : config.pauseLength || 1
  const pauseStr = '. '.repeat(pauseCount)
  enhancedText = enhancedText.replace(/\.\s/g, `${pauseStr} `)

  return enhancedText
}

export function generateEnhancedContent(content: string, analysis: AnalysisResponse): string {
  if (!analysis?.scenes) {
    return addNaturalPauses(content)
  }

  return analysis.scenes.reduce((enhancedContent, scene, index) => {
    let modifiedText = scene.text

    // Add emotion-specific enhancements
    if (scene.emotion) {
      modifiedText = addEmotionalCues(modifiedText, scene.emotion)
      modifiedText = addFillerWords(modifiedText, scene.emotion)
    }

    // Add natural pauses
    modifiedText = addNaturalPauses(modifiedText)

    // Add scene transitions
    const transition = index > 0 ? '... ' : ''

    return enhancedContent + transition + modifiedText
  }, '')
}