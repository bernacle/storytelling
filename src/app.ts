import { apiKeyRoutes } from "@/modules/api-keys/controllers/routes";
import { scriptRoutes } from "@/modules/scripts/controllers/routes";
import { userRoutes } from "@/modules/users/controllers/routes";
import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import fastify from "fastify";
import { ZodError } from "zod";
import { env } from "./env";
import { checkApiKey } from "./hooks/check-api-key";
import { imagesRoutes } from "./modules/images/controllers/routes";
import { musicsRoutes } from "./modules/musics/controllers/routes";
import { storiesRoutes } from "./modules/stories/controllers/routes";
import { voicesRoutes } from "./modules/voices/controllers/routes";

export const app = fastify();

app.register(swagger);
app.register(swaggerUI, {
  routePrefix: "/documentation",
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject, request, reply) => swaggerObject,
  transformSpecificationClone: true,
});

app.register(async function publicRoutes(app) {
  app.get("/healthcheck", async (request, reply) => {
    return { status: "OK" };
  });
  app.register(userRoutes);
  app.register(apiKeyRoutes);
});

app.register(async function protectedRoutes(app) {
  app.addHook("preHandler", checkApiKey);
  app.register(scriptRoutes);
  app.register(voicesRoutes);
  app.register(imagesRoutes);
  app.register(musicsRoutes);
  app.register(storiesRoutes);
});

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: "Validation error.", issues: error.format() });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  }

  return reply.status(500).send({ message: "Internal server error" });
});
