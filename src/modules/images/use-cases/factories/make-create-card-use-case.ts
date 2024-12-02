import { cardQueue } from '@/lib/queue';
import { PrismaScriptsRepository } from '@/modules/scripts/repositories/prisma/prisma-scripts-repository';
import { PrismaCardsRepository } from '../../repositories/prisma/prisma-cards-repository';
import { CreateCardUseCase } from '../create-card-use-case';

export function makeCreateCardUseCase() {
  const scriptsRepository = new PrismaScriptsRepository();
  const cardsRepository = new PrismaCardsRepository();

  return new CreateCardUseCase(scriptsRepository, cardsRepository, cardQueue);
}
