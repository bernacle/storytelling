type PlayHTEmotion =
  | 'female_happy' | 'female_sad' | 'female_angry'
  | 'female_fearful' | 'female_disgust' | 'female_surprised'
  | 'male_happy' | 'male_sad' | 'male_angry'
  | 'male_fearful' | 'male_disgust' | 'male_surprised';

const emotionMap: Record<string, string> = {
  'joy': 'happy',
  'happiness': 'happy',
  'delight': 'happy',
  'enthusiastic': 'happy',
  'anticipation': 'happy',
  'eagerness': 'happy',

  'sadness': 'sad',
  'nostalgia': 'sad',
  'melancholy': 'sad',
  'grief': 'sad',
  'disappointment': 'sad',

  'anger': 'angry',
  'rage': 'angry',
  'frustration': 'angry',

  'fear': 'fearful',
  'anxiety': 'fearful',
  'terror': 'fearful',

  'disgust': 'disgust',
  'repulsion': 'disgust',

  'surprise': 'surprised',
  'shock': 'surprised',
  'amazement': 'surprised',

  'hope': 'happy',
  'excitement': 'happy'
};


export function mapToPlayHTEmotion(
  scriptEmotion: string,
  gender: 'male' | 'female'
): PlayHTEmotion | null {


  const baseEmotion = emotionMap[scriptEmotion.toLowerCase()]

  if (!baseEmotion) return null

  return `${gender}_${baseEmotion}` as PlayHTEmotion
}