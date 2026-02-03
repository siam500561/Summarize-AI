import type { NextFunction, Request, Response } from "express";
import { config } from "../config";

export interface SummarizeRequestBody {
  text: string;
  length: "short" | "medium" | "long";
}

export function validateSummarizeRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { text, length } = req.body as Partial<SummarizeRequestBody>;

  // Validate text exists
  if (!text || typeof text !== "string") {
    res.status(400).json({
      success: false,
      error: "Text is required and must be a string",
    });
    return;
  }

  // Validate text length
  const trimmedText = text.trim();

  if (trimmedText.length < config.minTextLength) {
    res.status(400).json({
      success: false,
      error: `Text must be at least ${config.minTextLength} characters`,
    });
    return;
  }

  if (trimmedText.length > config.maxTextLength) {
    res.status(400).json({
      success: false,
      error: `Text must not exceed ${config.maxTextLength} characters`,
    });
    return;
  }

  // Validate length option
  const validLengths = ["short", "medium", "long"];
  if (length && !validLengths.includes(length)) {
    res.status(400).json({
      success: false,
      error: "Length must be 'short', 'medium', or 'long'",
    });
    return;
  }

  // Set default length if not provided
  req.body.length = length || "medium";
  req.body.text = trimmedText;

  next();
}
