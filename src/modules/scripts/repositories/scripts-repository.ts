import { Script, type Prisma } from '@prisma/client'

export interface ScriptsRepository {
  findById(id: string): Promise<Script | null>
  create(data: Prisma.ScriptCreateInput): Promise<Script>
  findManyByUserId(userId: string): Promise<Script[]>

}