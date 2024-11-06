import type { UsersRepository } from "@/repositories/users-repository";
import type { User } from "@prisma/client";

interface CreateUserUseCaseRequest {
  email: string
}

interface CreateUserUseCaseResponse {
  user: User
}

export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) { }

  async execute({ email }: CreateUserUseCaseRequest): Promise<CreateUserUseCaseResponse> {
    const user = await this.usersRepository.create({ email })
    return { user }
  }
}