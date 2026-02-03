import "dotenv/config";

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
    "http://localhost:3001",
  ],

  // Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || "",

  // Rate limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute per IP
  },

  // Request limits
  maxTextLength: 50000, // Maximum characters for text to summarize
  minTextLength: 50, // Minimum characters for text to summarize
};

// Validate required environment variables
export function validateEnv(): void {
  const required = ["GEMINI_API_KEY"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
