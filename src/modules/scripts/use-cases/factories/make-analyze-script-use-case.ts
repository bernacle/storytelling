
import Groq from "groq-sdk";
import { GroqAnalysisProvider } from "@/providers/text-analysis";
import { AnalyzeScriptUseCase } from "../analyze-script-use-case";
import { PrismaScriptsRepository } from "../../repositories/prisma/prisma-scripts-repository";
import { env } from "@/env";

export function makeAnalyzeScriptUseCase(): AnalyzeScriptUseCase {
  return new AnalyzeScriptUseCase(new PrismaScriptsRepository(), new GroqAnalysisProvider(new Groq({ apiKey: env.GROQ_API_KEY })))
}