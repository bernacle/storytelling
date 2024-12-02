import { Groq } from 'groq-sdk';
import type { AnalysisRequest, AnalysisResponse, CardAnalysisResponse } from '../types';

export class GroqAnalysisProvider {
  constructor(private groq: Groq) { }

  async analyzeStory({ content }: AnalysisRequest): Promise<AnalysisResponse> {
    const systemPrompt = `You are an expert script analyzer. Analyze the given script and identify its emotional structure, themes, and scenes.

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

Your response must be ONLY the JSON object with no additional text.`;

    return this.executePrompt(content, systemPrompt);
  }

  async analyzeCard({ content }: AnalysisRequest): Promise<CardAnalysisResponse> {
    const systemPrompt = `You are an expert card designer. Analyze the given card message and identify its emotional tone and design cues.

Return a JSON object with this exact structure:
{
  "emotions": [
    { "name": "emotion name", "intensity": 1-10 }
  ],
  "themes": ["theme1", "theme2"],
  "tone": "overall tone",
  "designSuggestions": {
    "colorPalette": ["color1", "color2"],
    "fontStyle": "suggested font style",
    "layout": "suggested layout type"
  },
  "suggestedMusic": "music style suggestion (if any)"
}

Guidelines:
1. Identify the primary tone and emotions
2. Extract themes
3. Suggest colors, fonts, and layout styles for the card
4. Suggest a music style (if applicable)

Your response must be ONLY the JSON object with no additional text.`;

    return this.executePrompt(content, systemPrompt);
  }

  private async executePrompt<T>(content: string, prompt: string): Promise<T> {
    const completion = await this.groq.chat.completions.create({
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content },
      ],
      model: 'mixtral-8x7b-32768',
      temperature: 0.3,
    });

    try {
      return JSON.parse(completion.choices[0].message.content || '{}') as T;
    } catch (error) {
      console.error('Failed to parse analysis:', error);
      throw new Error('Invalid analysis response');
    }
  }
}
