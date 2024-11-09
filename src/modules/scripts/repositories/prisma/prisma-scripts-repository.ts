import { prisma } from "@/lib/prisma"
import type { Prisma, Script } from "@prisma/client"
import type { ScriptsRepository } from "../scripts-repository"

export class PrismaScriptsRepository implements ScriptsRepository {
  async findById(id: string): Promise<Script | null> {
    const script = await prisma.script.findUnique({
      where: { id }
    })

    return script
  }

  async create(data: Prisma.ScriptCreateInput): Promise<Script> {
    const script = await prisma.script.create({ data })
    return script
  }

  async findManyByUserId(userId: string): Promise<Script[]> {
    const scripts = await prisma.script.findMany({
      where: {
        user_id: userId
      }
    })

    return scripts
  }

}