import {
  cardWorker,
  imageWorker,
  storyWorker,
  voiceWorker,
} from "./initialize-workers";

async function startWorkers() {
  voiceWorker.on("completed", (job) => {
    console.log(`Voice generation completed for job ${job.id}`);
  });

  imageWorker.on("completed", (job) => {
    console.log(`Image generation completed for job ${job.id}`);
  });
  cardWorker.on("completed", (job) => {
    console.log(`Card generation completed for job ${job.id}`);
  });

  storyWorker.on("completed", (job) => {
    console.log(`Story generation completed for job ${job.id}`);
  });

  // Error handlers
  const workers = [voiceWorker, imageWorker, storyWorker, cardWorker];
  workers.forEach((worker) => {
    worker.on("failed", (job, error) => {
      console.error(
        `Generation failed for job ${job?.id}:`,
        error.message || error
      );
    });
  });

  console.log("Workers started 🎙️ 🖼️ 🎬");

  const shutdown = async () => {
    console.log("Shutting down workers...");
    await Promise.all(workers.map((worker) => worker.close()));
    process.exit(0);
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startWorkers().catch((error) => {
  console.error("Failed to start workers:", error);
  process.exit(1);
});
