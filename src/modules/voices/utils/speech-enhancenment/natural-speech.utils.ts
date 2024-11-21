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
    return addNaturalPauses(content);
  }

  // Create a map of scene texts to their emotions
  const sceneEmotions = new Map(
    analysis.scenes.map(scene => [scene.text, scene.emotion])
  );

  // Split the content into parts and enhance each part based on whether it's a scene
  let currentPosition = 0;
  let enhancedContent = '';

  for (const scene of analysis.scenes) {
    // Find the scene's position in the original content
    const sceneIndex = content.indexOf(scene.text, currentPosition);

    if (sceneIndex > currentPosition) {
      // Add any content before the scene with natural pauses
      const beforeScene = content.slice(currentPosition, sceneIndex);
      enhancedContent += addNaturalPauses(beforeScene);
    }

    // Enhance the scene text with emotional cues
    let modifiedText = scene.text;
    if (scene.emotion) {
      modifiedText = addEmotionalCues(modifiedText, scene.emotion);
      modifiedText = addFillerWords(modifiedText, scene.emotion);
    }
    modifiedText = addNaturalPauses(modifiedText);

    enhancedContent += modifiedText;
    currentPosition = sceneIndex + scene.text.length;
  }

  // Add any remaining content after the last scene
  if (currentPosition < content.length) {
    const afterScenes = content.slice(currentPosition);
    enhancedContent += addNaturalPauses(afterScenes);
  }

  return enhancedContent;
}