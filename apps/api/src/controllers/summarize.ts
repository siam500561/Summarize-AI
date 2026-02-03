import type { Request, Response } from "express";
import type { SummarizeRequestBody } from "../middleware/validation";
import { summarizeText } from "../services/gemini";

export async function handleSummarize(
  req: Request,
  res: Response,
): Promise<void> {
  const { text, length } = req.body as SummarizeRequestBody;

  try {
    const startTime = Date.now();
    const summary = await summarizeText(text, length);
    const processingTime = Date.now() - startTime;

    // Calculate stats
    const originalWords = text.split(/\s+/).length;
    const summaryWords = summary.split(/\s+/).length;
    const reductionPercent = Math.round(
      (1 - summaryWords / originalWords) * 100,
    );
    const estimatedReadingTimeSaved = Math.round(
      (originalWords - summaryWords) / 200,
    ); // Assuming 200 WPM

    res.json({
      success: true,
      data: {
        summary,
        stats: {
          originalLength: text.length,
          summaryLength: summary.length,
          originalWords,
          summaryWords,
          reductionPercent: Math.max(0, reductionPercent),
          estimatedReadingTimeSaved: Math.max(0, estimatedReadingTimeSaved),
          processingTimeMs: processingTime,
        },
      },
    });
  } catch (error) {
    console.error("Summarization error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    res.status(500).json({
      success: false,
      error: errorMessage,
    });
  }
}

// Health check endpoint
export function handleHealthCheck(req: Request, res: Response): void {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}
