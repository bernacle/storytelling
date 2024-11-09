import { makeVoiceWorker } from "@/modules/voices/workers/factories/make-voice-worker"

async function startVoiceWorker() {
  const worker = makeVoiceWorker()

  worker.on('completed', (job) => {
    console.log(`Voice generation completed for job ${job.id}`)
  })

  worker.on('failed', (job, error) => {
    console.error(
      `Voice generation failed for job ${job?.id}:`,
      error.message || error
    )
  })

  console.log('Voice worker started 🎙️')
}

startVoiceWorker().catch((error) => {
  console.error('Failed to start voice worker:', error)
  process.exit(1)
})