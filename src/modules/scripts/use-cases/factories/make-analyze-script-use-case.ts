
import Groq from "groq-sdk";
import { GroqAnalysisProvider } from "@/providers/text-analysis";
import { AnalyzeScriptUseCase } from "../analyze-script";
import { PrismaScriptsRepository } from "../../repositories/prisma/prisma-scripts-repository";

export function makeAnalyzeScriptUseCase(): AnalyzeScriptUseCase {
  return new AnalyzeScriptUseCase(new PrismaScriptsRepository(), new GroqAnalysisProvider(new Groq({ apiKey: process.env.GROQ_API_KEY })))
}