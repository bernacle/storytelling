import type { Prisma, Image } from "@prisma/client";
import type { ImagesRepository } from "../images-repository";
import { prisma } from "@/lib/prisma";

export class PrismaImagesRepository implements ImagesRepository {
  async create(data: Prisma.ImageCreateInput): Promise<Image> {
    const image = await prisma.image.create({ data });
    return image;
  }

  async findById(id: string): Promise<Image | null> {
    const image = await prisma.image.findUnique({ where: { id } });
    return image;
  }

  async findByScriptId(scriptId: string) {
    return await prisma.image.findMany({
      where: { script_id: scriptId },
      orderBy: { scene_index: 'asc' }
    });
  }

  async save(data: Image): Promise<Image> {
    try {
      const exists = await this.findById(data.id);
      if (!exists) {
        throw new Error(`Image with ID ${data.id} not found`);
      }

      const image = await prisma.image.update({
        where: { id: data.id },
        data: {
          prompt: data.prompt,
          style: data.style,
          status: data.status,
          image_url: data.image_url,
          error: data.error,
          updated_at: new Date(),
        },
      });

      return image;
    } catch (error) {
      console.error('Error saving image:', error);
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
    data?: Partial<Image>
  ): Promise<Image> {
    try {
      const exists = await this.findById(id);
      if (!exists) {
        throw new Error(`Image with ID ${id} not found`);
      }

      return await prisma.image.update({
        where: { id },
        data: {
          status,
          ...(data || {}),
          updated_at: new Date(),
        }
      });
    } catch (error) {
      console.error(`Error updating image status for ID ${id}:`, error);
      throw error;
    }
  }
}