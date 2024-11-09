import type { Prisma, Image } from "@prisma/client";
import type { ImagesRepository } from "../images-repository";
import { prisma } from "@/lib/prisma";

export class PrismaImagesRepository implements ImagesRepository {
  async create(data: Prisma.ImageCreateInput): Promise<Image> {
    const image = await prisma.image.create({ data });
    return image
  }
  async findById(id: string): Promise<Image | null> {
    const image = await prisma.image.findUnique({ where: { id } });
    return image
  }
  async updateStatus(id: string, status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED", data?: Partial<Image>): Promise<Image> {
    return await prisma.image.update({
      where: { id },
      data: {
        status,
        ...data
      }
    })
  }

}
