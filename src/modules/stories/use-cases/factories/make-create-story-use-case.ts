import { storyQueue } from "@/lib/queue";
import { PrismaImagesRepository } from "@/modules/images/repositories/prisma/prisma-images-repository";
import { makeCreateImageUseCase } from "@/modules/images/use-cases/factories/make-create-image-use-case";
import { PrismaScriptsRepository } from "@/modules/scripts/repositories/prisma/prisma-scripts-repository";
import { PrismaStoriesRepository } from "@/modules/stories/repositories/prisma/prisma-stories-repository";
import { PrismaVoicesRepository } from "@/modules/voices/repositories/prisma/prisma-voices-repository";
import { makeCreateVoiceUseCase } from "@/modules/voices/use-cases/factories/make-create-voice-use-case";
import { CreateStoryUseCase } from "../create-story-use-case";

export function makeCreateStoryUseCase() {
  const scriptsRepository = new PrismaScriptsRepository();
  const voicesRepository = new PrismaVoicesRepository();
  const imagesRepository = new PrismaImagesRepository();
  const storiesRepository = new PrismaStoriesRepository();
  const createVoiceUseCase = makeCreateVoiceUseCase();
  const createImageUseCase = makeCreateImageUseCase();

  const useCase = new CreateStoryUseCase(
    scriptsRepository,
    voicesRepository,
    imagesRepository,
    storiesRepository,
    createVoiceUseCase,
    createImageUseCase,
    storyQueue
  );

  return useCase;
}
