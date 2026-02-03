import "dotenv/config";

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || "development",

  // CORS
  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],

  // Gemini AI
  geminiApiKey: process.env.GEMINI_API_KEY || "",

  // Arcjet for rate limiting and bot protection
  arcjetKey: process.env.ARCJET_KEY || "",

  // Request signing secret (must match frontend NEXT_PUBLIC_REQUEST_SECRET)
  requestSecret: process.env.REQUEST_SECRET || "",

  // Rate limiting (fallback if Arcjet is not configured)
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

  // Warn about missing optional but recommended variables in production
  if (process.env.NODE_ENV === "production") {
    const recommended = ["ARCJET_KEY", "REQUEST_SECRET"];
    const missingRecommended = recommended.filter((key) => !process.env[key]);

    if (missingRecommended.length > 0) {
      console.warn(
        `[Config] Missing recommended environment variables for production: ${missingRecommended.join(", ")}`,
      );
    }
  }
}
