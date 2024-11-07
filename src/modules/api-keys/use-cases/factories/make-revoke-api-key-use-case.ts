
import { PrismaApiKeysRepository } from "../../repositories/prisma/prisma-api-keys-repository";
import { RevokeApiKeyUseCase } from "../revoke-api-key-use-case";

export function makeRevokeApiKeysUseCase(): RevokeApiKeyUseCase {
  return new RevokeApiKeyUseCase(new PrismaApiKeysRepository())
}