import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "../config";

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

// Use Gemini 2.0 Flash model (latest as of 2026)
const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  generationConfig: {
    temperature: 0.4,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 2048,
  },
});

type SummaryLength = "short" | "medium" | "long";

const lengthInstructions: Record<SummaryLength, string> = {
  short:
    "Provide a very brief summary in 2-3 sentences, capturing only the most essential points.",
  medium:
    "Provide a balanced summary in 4-6 sentences, covering the main points and key details.",
  long: "Provide a comprehensive summary in 7-10 sentences, including main points, supporting details, and important nuances.",
};

export async function summarizeText(
  text: string,
  length: SummaryLength,
): Promise<string> {
  const prompt = `You are an expert text summarizer. Your task is to summarize the following text.

${lengthInstructions[length]}

Guidelines:
- Maintain the original meaning and context
- Use clear, concise language
- Preserve important facts, numbers, and names
- Do not add information not present in the original text
- Do not include phrases like "This text discusses" or "The author mentions"
- Write in a natural, flowing style

Text to summarize:
"""
${text}
"""

Summary:`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();

    if (!summary || summary.trim().length === 0) {
      throw new Error("Empty response from AI model");
    }

    return summary.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);

    if (error instanceof Error) {
      // Handle specific API errors
      if (error.message.includes("API key")) {
        throw new Error("AI service configuration error");
      }
      if (error.message.includes("quota")) {
        throw new Error("AI service quota exceeded. Please try again later.");
      }
      if (error.message.includes("blocked")) {
        throw new Error(
          "Content could not be processed. Please try different text.",
        );
      }
    }

    throw new Error("Failed to generate summary. Please try again.");
  }
}
