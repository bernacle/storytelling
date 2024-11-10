type MoodStyle = {
  baseLight: string
  basePalette: string
  composition: string
  atmosphere: string
}

type EmotionAccent = {
  lighting: string
  colors: string
  composition: string
  additional?: string
}

const moodStyles: Record<string, MoodStyle> = {
  dramatic: {
    baseLight: 'high-contrast with deep shadows',
    basePalette: 'rich saturated colors with deep blacks',
    composition: 'dynamic and cinematic angles',
    atmosphere: 'intense and impactful'
  },
  tense: {
    baseLight: 'harsh shadows with stark contrast',
    basePalette: 'cold undertones with bold accents',
    composition: 'tight framing with dutch angles',
    atmosphere: 'suspenseful and urgent'
  },
  mysterious: {
    baseLight: 'diffused with selective highlights',
    basePalette: 'muted with selective vibrance',
    composition: 'revealing and concealing elements',
    atmosphere: 'intriguing and secretive'
  },
  melancholic: {
    baseLight: 'soft and diffused overall lighting',
    basePalette: 'desaturated with subtle color accents',
    composition: 'spacious with isolated elements',
    atmosphere: 'contemplative and weighted'
  }
}

const emotionAccents: Record<string, EmotionAccent> = {
  'joy': {
    lighting: 'bright and warm',
    colors: 'vibrant and uplifting',
    composition: 'open and dynamic',
    additional: 'elements of movement and vitality'
  },
  'happiness': {
    lighting: 'bright and radiant',
    colors: 'warm and cheerful',
    composition: 'balanced and harmonious',
    additional: 'elements of connection and joy'
  },
  'delight': {
    lighting: 'sparkling and bright',
    colors: 'vivid and playful',
    composition: 'energetic and free-flowing',
    additional: 'elements of spontaneity and pleasure'
  },
  'enthusiastic': {
    lighting: 'bold and dynamic',
    colors: 'high-energy and vibrant',
    composition: 'active and engaging',
    additional: 'elements of passion and excitement'
  },
  'eagerness': {
    lighting: 'forward-focused and bright',
    colors: 'warm and inviting',
    composition: 'directional and purposeful',
    additional: 'elements of anticipation and readiness'
  },
  'nostalgia': {
    lighting: 'soft golden hour',
    colors: 'warm vintage tones',
    composition: 'intimate and reflective',
    additional: 'elements that evoke memory and time'
  },
  'melancholy': {
    lighting: 'soft and diffused',
    colors: 'muted blues and grays',
    composition: 'contemplative spacing',
    additional: 'elements of solitude and reflection'
  },
  'grief': {
    lighting: 'dark and heavy',
    colors: 'deep shadows and muted tones',
    composition: 'weighted and enclosed',
    additional: 'elements of loss and emptiness'
  },
  'disappointment': {
    lighting: 'fading or dimming',
    colors: 'dulled and subdued',
    composition: 'unbalanced or descending',
    additional: 'elements of unfulfillment'
  },
  'anger': {
    lighting: 'harsh and intense',
    colors: 'deep reds and strong contrasts',
    composition: 'angular and confrontational',
    additional: 'elements of tension and force'
  },
  'rage': {
    lighting: 'explosive and dramatic',
    colors: 'intense reds and blacks',
    composition: 'chaotic and overwhelming',
    additional: 'elements of destruction and power'
  },
  'frustration': {
    lighting: 'sharp and uneven',
    colors: 'clashing and turbulent',
    composition: 'restricted or constrained',
    additional: 'elements of obstruction and tension'
  },
  'fear': {
    lighting: 'dark with harsh shadows',
    colors: 'cold and desaturated',
    composition: 'claustrophobic or unbalanced',
    additional: 'elements of threat and uncertainty'
  },
  'anxiety': {
    lighting: 'flickering or unstable',
    colors: 'nervous and unsettling',
    composition: 'tight and crowded',
    additional: 'elements of disorder and unease'
  },
  'terror': {
    lighting: 'extreme contrast and shadows',
    colors: 'stark and threatening',
    composition: 'extreme and overwhelming',
    additional: 'elements of immediate danger'
  },
  'disgust': {
    lighting: 'sickly or unnatural',
    colors: 'discordant and unsettling',
    composition: 'uncomfortable or twisted',
    additional: 'elements of repulsion'
  },
  'repulsion': {
    lighting: 'harsh and revealing',
    colors: 'nauseating and distorted',
    composition: 'repelling and distancing',
    additional: 'elements of aversion'
  },
  'surprise': {
    lighting: 'sudden and dramatic',
    colors: 'striking and unexpected',
    composition: 'asymmetric and dynamic',
    additional: 'elements of revelation'
  },
  'shock': {
    lighting: 'stark and intense',
    colors: 'jarring contrasts',
    composition: 'destabilizing and immediate',
    additional: 'elements of disruption'
  },
  'amazement': {
    lighting: 'brilliant and enchanting',
    colors: 'rich and magical',
    composition: 'expansive and awe-inspiring',
    additional: 'elements of wonder and scale'
  },
  'hope': {
    lighting: 'dawning or emerging',
    colors: 'promising and fresh',
    composition: 'upward and opening',
    additional: 'elements of possibility and renewal'
  },
  'excitement': {
    lighting: 'dynamic and energetic',
    colors: 'vivid and animated',
    composition: 'active and spirited',
    additional: 'elements of motion and enthusiasm'
  },
  'anticipation': {
    lighting: 'growing or directional',
    colors: 'building intensity',
    composition: 'forward-leaning or ascending',
    additional: "elements suggesting what's to come"
  },
  'sadness': {
    lighting: 'subdued and low-key',
    colors: 'desaturated and cool',
    composition: 'heavy negative space',
    additional: 'elements of weight or descent'
  }
}

export function createVisualPrompt(
  text: string,
  sceneEmotion: string,
  mood: string,
  style: 'REALISTIC' | 'CARTOON' | 'MINIMALISTIC'
): string {
  const moodStyle = moodStyles[mood.toLowerCase()] || {
    baseLight: 'balanced lighting',
    basePalette: 'natural colors',
    composition: 'standard framing',
    atmosphere: 'neutral'
  }

  const emotionAccent = emotionAccents[sceneEmotion.toLowerCase()] || {
    lighting: 'neutral lighting',
    colors: 'balanced colors',
    composition: 'standard composition',
  }

  const styleSpecs = {
    'REALISTIC': {
      primary: 'ultra-realistic photographic quality',
      details: 'highly detailed photorealistic textures',
      rendering: 'photoreal rendering like a high-end DSLR photograph',
      reference: 'reference: professional photography, not digital art',
      processing: 'natural photo processing, not artistic filters'
    },
    'CARTOON': {
      primary: 'stylized animation style',
      details: 'clean vector-like shapes and bold lines',
      rendering: 'animated movie quality rendering',
      reference: 'reference: high-end animated films',
      processing: 'cartoon-appropriate color and shading'
    },
    'MINIMALISTIC': {
      primary: 'simplified essential elements',
      details: 'minimal detail with focus on core shapes',
      rendering: 'clean geometric style',
      reference: 'reference: minimalist design artwork',
      processing: 'reduced color palette and basic forms'
    }
  }[style]

  return `Create a scene in ${styleSpecs.primary} that captures: "${text}"

STRICT STYLE ENFORCEMENT:
- Primary Style: ${styleSpecs.primary}
- Detail Level: ${styleSpecs.details}
- Rendering: ${styleSpecs.rendering}
- Reference Style: ${styleSpecs.reference}
- Processing: ${styleSpecs.processing}

Base Mood (Maintained Across Scenes):
- Primary Lighting: ${moodStyle.baseLight}
- Color Scheme: ${moodStyle.basePalette}
- Overall Composition: ${moodStyle.composition}
- Atmosphere: ${moodStyle.atmosphere}

Scene-Specific Emotion:
- Lighting Accent: ${emotionAccent.lighting}
- Color Accent: ${emotionAccent.colors}
- Dynamic Elements: ${emotionAccent.composition}
${emotionAccent.additional ? `- Additional Focus: ${emotionAccent.additional}` : ''}

Critical Requirements:
1. MUST maintain ${style.toLowerCase()} style consistently
2. NO mixing of styles (no cartoon elements in realistic mode)
3. STRICT adherence to photorealism in REALISTIC mode
4. Maintain exact same visual approach across all scenes
5. Use consistent character and location representation
6. Apply uniform post-processing across series

Technical Consistency:
- Camera: ${style === 'REALISTIC' ? 'photographic lens characteristics' : 'consistent viewpoint style'}
- Detail: ${style === 'REALISTIC' ? 'photorealistic detail throughout' : 'consistent stylization'}
- Color: professional color grading matching ${style.toLowerCase()} style
- Quality: high-end ${style === 'REALISTIC' ? 'photography' : 'rendering'} quality
- Continuity: maintain perfect style match between scenes`
}
