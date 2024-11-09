
import { ListScriptsUseCase } from "../list-scripts-use-case";
import { PrismaScriptsRepository } from "../../repositories/prisma/prisma-scripts-repository";

export function makeListScriptsUseCase(): ListScriptsUseCase {
  return new ListScriptsUseCase(new PrismaScriptsRepository())
}