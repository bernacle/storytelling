import { Groq } from 'groq-sdk'
import type { AnalysisRequest, AnalysisResponse, TextAnalysisProvider } from '..';

export class GroqAnalysisProvider implements TextAnalysisProvider {
  constructor(private groq: Groq) { }

  async analyze({ content, targetEmotion }: AnalysisRequest): Promise<AnalysisResponse> {
    const completion = await this.groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Analyze this script and return a JSON object with this exact structure:
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
                  "text": "start of scene...",
                  "emotion": "primary emotion"
                }
              ]
              ${targetEmotion ? ',"modifiedScript": "modified version for target emotion"' : ''}
            }`,
        },
        {
          role: 'user',
          content,
        },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
    })

    const analysis = completion.choices[0].message.content

    return JSON.parse(analysis || '{}')
  }
}