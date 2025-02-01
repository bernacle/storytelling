import { redis } from "@/lib/redis";
import { Queue } from "bullmq";

const RATE_LIMIT_DELAY = 60 * 1000;

export const imageQueue = new Queue("generate-image", {
  connection: redis,
  prefix: "storytelling",
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: RATE_LIMIT_DELAY,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  },
});

export const cardQueue = new Queue("generate-card", { connection: redis });

export const voiceQueue = new Queue("voice-generation", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: 1000,
  },
});

export const storyQueue = new Queue("generate-story", {
  connection: redis,
  prefix: "storytelling",
  defaultJobOptions: {
    attempts: 2,
    backoff: {
      type: "exponential",
      delay: RATE_LIMIT_DELAY,
    },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 100 },
  },
});
