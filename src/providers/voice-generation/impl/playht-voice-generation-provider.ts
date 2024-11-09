import * as PlayHT from 'playht';
import type { VoiceGenerationProvider } from '../voice-generation-provider';
import type { VoiceGenerationOptions } from '../types';
import { mapToPlayHTEmotion } from './emotion-mapper';

export class PlayHTProvider implements VoiceGenerationProvider {
  constructor() {
    if (!process.env.PLAYHT_API_KEY || !process.env.PLAYHT_USER_ID) {
      throw new Error('PlayHT credentials not configured')
    }

    PlayHT.init({
      apiKey: process.env.PLAYHT_API_KEY,
      userId: process.env.PLAYHT_USER_ID,
    })
  }

  async generate(text: string, options: VoiceGenerationOptions) {
    try {
      console.log('Starting PlayHT generation with config:', {
        apiKey: process.env.PLAYHT_API_KEY ? 'set' : 'missing',
        userId: process.env.PLAYHT_USER_ID ? 'set' : 'missing',
      })

      const voices = await PlayHT.listVoices()

      const selectedVoice = voices.find(v => v.id === options.voiceId)

      if (!selectedVoice) {
        throw new Error('Invalid voice ID')
      }

      const emotion = mapToPlayHTEmotion(
        options.tone,
        selectedVoice.gender as 'male' | 'female'
      )

      const generateOptions: PlayHT.SpeechOptions = {
        voiceId: options.voiceId,
        quality: 'high',
        speed: options.speed || 1,
        voiceEngine: 'PlayHT2.0',
        ...(emotion ? { emotion } : {}),
      }



      console.log('PlayHT generate options:', generateOptions)

      const generated = await PlayHT.generate(text, generateOptions)

      console.log('PlayHT response:', generated)

      if (!generated || !generated.audioUrl) {
        throw new Error(`Invalid PlayHT response: ${JSON.stringify(generated)}`)
      }

      return {
        audioUrl: generated.audioUrl
      }
    } catch (error) {
      console.error('Raw PlayHT error:', error)

      if (error instanceof Error) {
        throw error
      }

      if (error && typeof error === 'object') {
        throw new Error(
          `PlayHT API error: ${JSON.stringify(error, null, 2)}`
        )
      }

      throw new Error(`Unknown PlayHT error: ${error}`)
    }
  }
}
