import type { UsersRepository } from "@/modules/users/repositories/users-repository";
import type { User } from "@prisma/client";
import { UserAlreadyExistsError } from "./errors/user-already-exists-error";

type CreateUserUseCaseRequest = {
  email: string
}

type CreateUserUseCaseResponse = {
  user: User
}

export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) { }

  async execute({ email }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {

    const userWithSameEmail = await this.usersRepository.findByEmail(email)

    if (userWithSameEmail) {
      throw new UserAlreadyExistsError()
    }

    const user = await this.usersRepository.create({ email })
    return { user }
  }
}