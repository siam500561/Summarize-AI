import arcjet, {
  detectBot,
  shield,
  slidingWindow,
  tokenBucket,
} from "@arcjet/node";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config";

// Initialize Arcjet with multiple protection layers
const aj = arcjet({
  key: config.arcjetKey,
  characteristics: ["ip.src"], // Track by IP address
  rules: [
    // Shield - Protects against common attacks (SQL injection, XSS, etc.)
    shield({ mode: "LIVE" }),

    // Bot detection - Block automated tools like Postman, curl, scripts
    detectBot({
      mode: "LIVE",
      allow: [], // Allow no bots - this blocks curl, postman, scripts, etc.
    }),

    // Sliding window rate limit - 10 requests per minute per IP
    slidingWindow({
      mode: "LIVE",
      interval: "1m",
      max: 10,
    }),

    // Token bucket for burst protection - prevents rapid-fire requests
    tokenBucket({
      mode: "LIVE",
      refillRate: 2, // Refill 2 tokens per interval
      interval: "10s", // Every 10 seconds
      capacity: 5, // Maximum 5 tokens (burst capacity)
    }),
  ],
});

export async function arcjetProtect(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  // Skip Arcjet in development if no key is configured
  if (config.nodeEnv === "development" && !config.arcjetKey) {
    console.warn("[Arcjet] No API key configured, skipping protection");
    next();
    return;
  }

  try {
    const decision = await aj.protect(req, { requested: 1 });

    // Add rate limit headers if available
    if (decision.reason.isRateLimit()) {
      const resetTime = decision.reason.resetTime;
      res.setHeader("X-RateLimit-Limit", decision.reason.max);
      res.setHeader("X-RateLimit-Remaining", decision.reason.remaining);
      if (resetTime) {
        res.setHeader("X-RateLimit-Reset", resetTime.toISOString());
      }
    }

    if (decision.isDenied()) {
      // Log the denial for monitoring
      console.log("[Arcjet] Request denied:", {
        ip: req.ip,
        reason: decision.reason,
        conclusion: decision.conclusion,
      });

      if (decision.reason.isRateLimit()) {
        const resetTime = decision.reason.resetTime;
        const retryAfter = resetTime
          ? Math.ceil((resetTime.getTime() - Date.now()) / 1000)
          : 60;

        res.status(429).json({
          success: false,
          error: "Too many requests. Please slow down.",
          retryAfter,
        });
        return;
      }

      if (decision.reason.isBot()) {
        res.status(403).json({
          success: false,
          error:
            "Automated requests are not allowed. Please use the web application.",
        });
        return;
      }

      if (decision.reason.isShield()) {
        res.status(403).json({
          success: false,
          error: "Request blocked for security reasons.",
        });
        return;
      }

      // Generic denial
      res.status(403).json({
        success: false,
        error: "Access denied.",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("[Arcjet] Error:", error);
    // Fail open in case of Arcjet errors, but log it
    next();
  }
}
