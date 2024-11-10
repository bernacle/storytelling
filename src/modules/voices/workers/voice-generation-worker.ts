import { Job, Worker } from 'bullmq'
import type * as IORedis from 'ioredis'
import { VoicesRepository } from '../repositories/voices-repository'
import { ScriptsRepository } from '../../scripts/repositories/scripts-repository'
import type { VoiceGenerationProvider, VoicePreference } from '@/providers/voice-generation'
import type { AnalysisResponse } from '@/providers/text-analysis'
import { generateEnhancedContent } from '../utils'

type VoiceGenerationJob = {
  voiceId: string
  scriptId: string
  voiceOptions: {
    options: VoicePreference
    tone?: string
  }
}

export function createVoiceWorker(
  connection: IORedis.Redis | IORedis.Cluster,
  voicesRepository: VoicesRepository,
  scriptsRepository: ScriptsRepository,
  voiceProvider: VoiceGenerationProvider,
) {
  return new Worker<VoiceGenerationJob>(
    'voice-generation',
    async (job: Job) => {
      const { voiceId, scriptId, voiceOptions } = job.data

      try {
        console.log(`Processing voice generation for script ${scriptId}`)
        await voicesRepository.updateStatus(voiceId, 'PROCESSING')

        const script = await scriptsRepository.findById(scriptId)
        if (!script) {
          throw new Error(`Script not found: ${scriptId}`)
        }

        console.log('Generating voice with options:', voiceOptions)
        const analysis = script.analysis as AnalysisResponse

        // Generate enhanced content with natural speech patterns
        const enhancedContent = generateEnhancedContent(script.content, analysis)

        const result = await voiceProvider.generate(
          enhancedContent,
          voiceOptions
        )

        console.log('Voice generation successful:', result)

        await voicesRepository.updateStatus(voiceId, 'COMPLETED', {
          audio_url: result.audioUrl
        })
      } catch (error) {
        console.error('Voice generation error:', {
          error: error instanceof Error ? error.stack : error,
          voiceId,
          scriptId,
          options: voiceOptions
        })

        await voicesRepository.updateStatus(voiceId, 'FAILED', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        throw error
      }
    },
    {
      connection,
      concurrency: 5
    }
  )
}