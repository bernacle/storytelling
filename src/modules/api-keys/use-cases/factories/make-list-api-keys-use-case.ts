
import { PrismaApiKeysRepository } from "../../repositories/prisma/prisma-api-keys-repository";
import { ListApiKeysUseCase } from "../list-api-keys-user-case";

export function makeListApiKeysUseCase(): ListApiKeysUseCase {
  return new ListApiKeysUseCase(new PrismaApiKeysRepository())
}