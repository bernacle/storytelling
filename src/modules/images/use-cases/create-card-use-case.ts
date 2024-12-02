import type { ScriptsRepository } from "@/modules/scripts/repositories/scripts-repository";
import type { CardAnalysisResponse } from "@/providers/text-analysis";
import type { Card } from "@prisma/client";
import { Queue } from "bullmq";
import type { CardsRepository } from "../repositories/cards-repository";

type CreateCardUseCaseRequest = {
  scriptId: string;
};

type CreateCardUseCaseResponse = {
  card: Card;
};

export class CreateCardUseCase {
  constructor(
    private readonly scriptsRepository: ScriptsRepository,
    private readonly cardsRepository: CardsRepository,
    private readonly cardQueue: Queue
  ) { }

  async execute({ scriptId }: CreateCardUseCaseRequest): Promise<CreateCardUseCaseResponse> {
    const script = await this.scriptsRepository.findById(scriptId);

    if (!script) {
      throw new Error("Script not found");
    }

    const analysis = script.analysis as CardAnalysisResponse;


    const colorPalette =
      analysis?.designSuggestions?.colorPalette ||
      ["bright pink", "yellow", "light blue"];

    const card = await this.cardsRepository.create({
      script: { connect: { id: scriptId } },
      user: { connect: { id: script.user_id } },
      color_palette: colorPalette,
      font_style: "playful script",
      layout: "asymmetrical",
      status: "PENDING",
    });


    const prompt = `
  Generate a card background with the following attributes:
  - Layout: ${card.layout || "default layout"}
  - Font Style: ${card.font_style || "default font style"}
  - Colors: ${colorPalette.join(", ")}
  Ensure the design is clean and suitable for users to overlay text later.
`;

    await this.cardQueue.add("generate-card", {
      cardId: card.id,
      scriptId: script.id,
      options: {
        prompt,
      },
    });

    return { card };
  }
}

