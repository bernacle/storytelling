
import { CreateUserUseCase } from "../create-api-key-use-case";
import { PrismaApiKeysRepository } from "@/repositories/prisma/prisma-api-keys-repository";

export function makeCreateApiKeyUseCase(): CreateUserUseCase {
  return new CreateUserUseCase(new PrismaApiKeysRepository())
}