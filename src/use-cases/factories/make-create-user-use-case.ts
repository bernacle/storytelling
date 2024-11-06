
import { CreateUserUseCase } from "../create-user-use-case";
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository";

export function makeCreateUserUseCase(): CreateUserUseCase {
  return new CreateUserUseCase(new PrismaUsersRepository())
}