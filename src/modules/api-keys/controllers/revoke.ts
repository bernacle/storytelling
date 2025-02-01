import { makeRevokeApiKeysUseCase } from "@/modules/api-keys/use-cases/factories/make-revoke-api-key-use-case";
import { FastifyReply, FastifyRequest } from "fastify";
import { ApiKeyRevoked } from "../use-cases/errors/api-key-already-revoked-error";
import { revokeApiKeyBodySchema, revokeApiKeyParamsSchema } from "./schemas";

export async function revoke(request: FastifyRequest, reply: FastifyReply) {
  const { id } = revokeApiKeyParamsSchema.parse(request.params);
  const { user_id } = revokeApiKeyBodySchema.parse(request.body);

  const revokeApiKeyUseCase = makeRevokeApiKeysUseCase();
  try {
    await revokeApiKeyUseCase.execute({
      id,
      userId: user_id,
    });
  } catch (err) {
    if (err instanceof ApiKeyRevoked) {
      return reply.status(409).send({ message: err.message });
    }
    throw err;
  }

  return reply.status(204).send();
}
