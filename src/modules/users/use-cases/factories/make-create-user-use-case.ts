
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-repository";
import { CreateUserUseCase } from "../create-user-use-case";

export function makeCreateUserUseCase(): CreateUserUseCase {
  return new CreateUserUseCase(new PrismaUsersRepository())
}