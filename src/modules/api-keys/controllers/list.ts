import { makeListApiKeysUseCase } from "@/modules/api-keys/use-cases/factories/make-list-api-keys-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { listApiKeysParamsSchema } from "./schemas";

export async function list(request: FastifyRequest, reply: FastifyReply) {
  const listApiKeysUseCase = makeListApiKeysUseCase();

  const { user_id } = listApiKeysParamsSchema.parse(request.query);

  const { apiKeys } = await listApiKeysUseCase.execute({
    userId: user_id,
  });

  return reply.status(201).send({ apiKeys });
}
