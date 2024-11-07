
import { PrismaApiKeysRepository } from "../../repositories/prisma/prisma-api-keys-repository";
import { CreateUserUseCase } from "../create-api-key-use-case";


export function makeCreateApiKeyUseCase(): CreateUserUseCase {
  return new CreateUserUseCase(new PrismaApiKeysRepository())
}