import { makeCreateImageUseCase } from '@/modules/images/use-cases/factories/make-create-image-use-case';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { makeCreateCardUseCase } from '../use-cases/factories/make-create-card-use-case';

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const createSchema = z.object({
    script_id: z.string().uuid(),
    style: z.enum(['REALISTIC', 'CARTOON', 'MINIMALISTIC']).optional(),
    type: z.enum(['STORY', 'CARD']).default('STORY'),
  });

  const { script_id, style, type } = createSchema.parse(request.body);

  if (type === 'STORY') {
    const createImageUseCase = makeCreateImageUseCase();

    const { images } = await createImageUseCase.execute({
      scriptId: script_id,
      style: style || 'REALISTIC',
    });

    return reply.status(202).send({ images });
  } else if (type === 'CARD') {
    const createCardUseCase = makeCreateCardUseCase();

    const { card } = await createCardUseCase.execute({
      scriptId: script_id,
    });

    return reply.status(202).send({ card });
  } else {
    return reply.status(400).send({ error: 'Invalid type provided' });
  }
}
