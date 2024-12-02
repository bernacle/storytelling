import type { Card, Prisma } from "@prisma/client";

export interface CardsRepository {
  create(data: Prisma.CardCreateInput): Promise<Card>;
  findById(id: string): Promise<Card | null>;
  findByScriptId(scriptId: string): Promise<Card[]>;
  save(data: Card): Promise<Card>;
  updateStatus(
    id: string,
    status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED",
    data?: Partial<Card>
  ): Promise<Card>;
}
