import { ConnectionOptions, Job, Worker } from 'bullmq'
import { VoicesRepository } from '../repositories/voices-repository'
import { ScriptsRepository } from '../../scripts/repositories/scripts-repository'
import type { VoiceGenerationProvider } from '@/providers/voice-generation'
import type * as IORedis from 'ioredis'

interface VoiceGenerationJob {
  voiceId: string
  scriptId: string
  voiceOptions: {
    voiceId: string
    tone?: string
    speed?: number
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
        // Update status to processing
        await voicesRepository.updateStatus(voiceId, 'PROCESSING')

        // Get script content
        const script = await scriptsRepository.findById(scriptId)
        if (!script) {
          throw new Error('Script not found')
        }

        // Generate voice
        const result = await voiceProvider.generate(
          script.content,
          voiceOptions
        )

        // Update with result
        await voicesRepository.updateStatus(voiceId, 'COMPLETED', {
          audio_url: result.audioUrl
        })
      } catch (error) {
        // Update status to failed
        await voicesRepository.updateStatus(voiceId, 'FAILED', {
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        throw error // Rethrow to trigger BullMQ retry
      }
    },
    {
      connection,
      concurrency: 5
    }
  )
}