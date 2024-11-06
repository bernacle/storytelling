
import { ListApiKeysUseCase } from "../list-api-keys-user-case";
import { PrismaApiKeysRepository } from "@/repositories/prisma/prisma-api-keys-repository";

export function makeListApiKeysUseCase(): ListApiKeysUseCase {
  return new ListApiKeysUseCase(new PrismaApiKeysRepository())
}