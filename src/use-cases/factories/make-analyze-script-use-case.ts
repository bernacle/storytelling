
import Groq from "groq-sdk";
import { GroqAnalysisProvider } from "@/providers/text-analysis";
import { PrismaScriptsRepository } from "@/repositories/prisma/prisma-scripts-repository";
import { AnalyzeScriptUseCase } from "../analyze-script";

export function makeAnalyzeScriptUseCase(): AnalyzeScriptUseCase {
  return new AnalyzeScriptUseCase(new PrismaScriptsRepository(), new GroqAnalysisProvider(new Groq({ apiKey: process.env.GROQ_API_KEY })))
}