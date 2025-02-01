import { PrismaApiKeysRepository } from "../../repositories/prisma/prisma-api-keys-repository";
import { CreateApiKeyUseCase } from "../create-api-key-use-case";

export function makeCreateApiKeyUseCase(): CreateApiKeyUseCase {
  return new CreateApiKeyUseCase(new PrismaApiKeysRepository());
}
