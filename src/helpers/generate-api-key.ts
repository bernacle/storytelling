import { randomUUID } from "node:crypto";

export function generateApiKey(): string {
  return `sk_live_${Date.now()}_${randomUUID()}`
}