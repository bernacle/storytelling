import { makeCreateApiKeyUseCase } from "@/modules/api-keys/use-cases/factories/make-create-api-key-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { createApiKeyParamsSchema } from "./schemas";

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const { label, user_id } = createApiKeyParamsSchema.parse(request.body);

  const createApiKeyUseCase = makeCreateApiKeyUseCase();

  const { apiKey } = await createApiKeyUseCase.execute({
    label,
    userId: user_id,
  });

  return reply.status(201).send({ apiKey });
}
