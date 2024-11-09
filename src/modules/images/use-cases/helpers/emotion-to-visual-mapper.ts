const emotionToVisualMap: Record<string, {
  lighting: string;
  colors: string;
  composition: string;
  additional?: string;
}> = {
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
};


export function createVisualPrompt(
  text: string,
  emotion: string,
  mood: string,
  style: 'REALISTIC' | 'CARTOON' | 'MINIMALISTIC'
): string {
  const visuals = emotionToVisualMap[emotion.toLowerCase()] ?? {
    lighting: 'balanced natural',
    colors: 'true to scene',
    composition: 'cinematically balanced',
  };

  const styleModifier = {
    'REALISTIC': 'photorealistic quality with natural textures and detailed lighting',
    'CARTOON': 'bold outlines and simplified yet expressive shapes',
    'MINIMALISTIC': 'essential elements only with strong use of negative space'
  }[style];

  return `Create a ${style.toLowerCase()} scene that captures: "${text}".
Mood is ${mood} with ${visuals.lighting} lighting.
Use a palette of ${visuals.colors}.
Frame the composition to be ${visuals.composition}.
${visuals.additional ? `Incorporate ${visuals.additional}.` : ''}
Style should be ${styleModifier}.
Make it cinematically compelling.`;
}