import { makeImageWorker } from "@/modules/images/workers/factories/make-image-worker"
import { makeVoiceWorker } from "@/modules/voices/workers/factories/make-voice-worker"


async function startWorkers() {
  const voiceWorker = makeVoiceWorker()

  voiceWorker.on('completed', (job) => {
    console.log(`Voice generation completed for job ${job.id}`)
  })

  voiceWorker.on('failed', (job, error) => {
    console.error(
      `Voice generation failed for job ${job?.id}:`,
      error.message || error
    )
  })

  const imageWorker = makeImageWorker()

  imageWorker.on('completed', (job) => {
    console.log(`Image generation completed for job ${job.id}`)
  })

  imageWorker.on('failed', (job, error) => {
    console.error(
      `Image generation failed for job ${job?.id}:`,
      error.message || error
    )
  })

  console.log('Workers started 🎙️ 🖼️')

  const shutdown = async () => {
    console.log('Shutting down workers...')
    await Promise.all([
      voiceWorker.close(),
      imageWorker.close()
    ])
    process.exit(0)
  }

  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

startWorkers().catch((error) => {
  console.error('Failed to start workers:', error)
  process.exit(1)
})