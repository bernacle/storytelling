import { prisma } from "@/lib/prisma";
import type { Card, Prisma } from "@prisma/client";
import type { InputJsonValue } from "@prisma/client/runtime/library";

export class PrismaCardsRepository {
  async create(data: Prisma.CardCreateInput): Promise<Card> {
    const card = await prisma.card.create({ data });
    return card;
  }

  async findById(id: string): Promise<Card | null> {
    const card = await prisma.card.findUnique({ where: { id } });
    return card;
  }

  async findByScriptId(scriptId: string): Promise<Card[]> {
    return await prisma.card.findMany({
      where: { script_id: scriptId },
      orderBy: { created_at: "asc" },
    });
  }

  async save(data: Card): Promise<Card> {
    try {
      const exists = await this.findById(data.id);
      if (!exists) {
        throw new Error(`Card with ID ${data.id} not found`);
      }

      const card = await prisma.card.update({
        where: { id: data.id },
        data: {
          color_palette: data.color_palette as InputJsonValue,
          font_style: data.font_style,
          layout: data.layout,
          card_url: data.card_url,
          updated_at: new Date(),
        },
      });

      return card;
    } catch (error) {
      console.error("Error saving card:", error);
      throw error;
    }
  }

  async updateStatus(
    id: string,
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
    data?: Partial<Card>
  ): Promise<Card> {
    try {
      const exists = await this.findById(id);
      if (!exists) {
        throw new Error(`Card with ID ${id} not found`);
      }

      const updateData = {
        ...data,
        color_palette: data?.color_palette as Prisma.InputJsonValue | undefined,
        status,
        updated_at: new Date(),
      };

      return await prisma.card.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      console.error(`Error updating card status for ID ${id}:`, error);
      throw error;
    }
  }


}
