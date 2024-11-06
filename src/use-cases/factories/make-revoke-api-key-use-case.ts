
import { RevokeApiKeyUseCase } from "../revoke-api-key-use-case";
import { PrismaApiKeysRepository } from "@/repositories/prisma/prisma-api-keys-repository";

export function makeRevokeApiKeysUseCase(): RevokeApiKeyUseCase {
  return new RevokeApiKeyUseCase(new PrismaApiKeysRepository())
}