import { Groq } from 'groq-sdk'
import type { AnalysisRequest, AnalysisResponse, TextAnalysisProvider } from '..'

export class GroqAnalysisProvider implements TextAnalysisProvider {
  constructor(private groq: Groq) { }

  async analyze({ content }: AnalysisRequest): Promise<AnalysisResponse> {
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert script analyzer. Analyze the given script and identify its emotional structure, themes, and scenes.

Return a JSON object with this exact structure:
{
  "emotions": [
    { "name": "emotion name", "intensity": 1-10 }
  ],
  "themes": ["theme1", "theme2"],
  "tone": "overall tone",
  "mood": "overall mood",
  "suggestedMusic": "music style suggestion",
  "scenes": [
    {
      "text": "scene content",
      "emotion": "primary emotion of the scene"
    }
  ]
}

Guidelines:
1. Break the script into meaningful scenes
2. Identify the primary emotion for each scene
3. List emotions with their intensity (1-10)
4. Extract key themes
5. Determine overall tone and mood
6. Suggest appropriate music style

Your response must be ONLY the JSON object with no additional text.`
        },
        {
          role: 'user',
          content
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
    })

    try {
      return JSON.parse(completion.choices[0].message.content || '{}')
    } catch (error) {
      console.error('Failed to parse analysis:', error)
      throw new Error('Invalid analysis response')
    }
  }
}