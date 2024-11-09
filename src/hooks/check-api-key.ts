import { prisma } from "@/lib/prisma"
import type { FastifyRequest, FastifyReply } from "fastify"

export async function checkApiKey(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const apiKey = request.headers['x-api-key']

  if (!apiKey) {
    return reply.status(401).send({
      error: 'Missing API key. Add x-api-key header'
    })
  }

  console.log("apiKey", apiKey)

  try {
    const key = await prisma.apiKey.findFirst({
      where: {
        api_key: apiKey as string,
        status: 'ACTIVE',
      },
    })

    if (!key) {
      return reply.status(401).send({
        error: 'Invalid or inactive API key'
      })
    }

    request.user = {
      id: key.user_id
    }
    request.apiKey = {
      id: key.id,
      label: key.label
    }

  } catch (error) {
    return reply.status(500).send({
      error: 'Error validating API key'
    })
  }
}
