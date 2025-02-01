import { FastifyInstance } from "fastify";
import { create } from "./create";
import { list } from "./list";
import { revoke } from "./revoke";

export async function apiKeyRoutes(app: FastifyInstance) {
  app.post("/api-keys", create);
  app.get("/api-keys", list);
  app.put("/api-keys/:id", revoke);
}
