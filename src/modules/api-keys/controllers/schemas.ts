import { z } from "zod";

export const createApiKeyParamsSchema = z.object({
  label: z.string(),
  user_id: z.string(),
});

export const listApiKeysParamsSchema = z.object({
  user_id: z.string(),
});

export const revokeApiKeyParamsSchema = z.object({
  id: z.string(),
});
export const revokeApiKeyBodySchema = z.object({
  user_id: z.string(),
});
