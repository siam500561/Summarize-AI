import type { NextFunction, Request, Response } from "express";
import { config } from "../config";

// Simple in-memory rate limiter (use Redis in production for distributed systems)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

export function rateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
  const key = `${ip}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.rateLimit.windowMs,
    });
    next();
    return;
  }

  if (record.count >= config.rateLimit.maxRequests) {
    res.status(429).json({
      success: false,
      error: "Too many requests. Please try again later.",
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    });
    return;
  }

  record.count++;
  next();
}

// Validate request origin
export function validateOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const origin = req.headers.origin || req.headers.referer;

  // Skip origin check in development
  if (config.nodeEnv === "development") {
    next();
    return;
  }

  if (!origin) {
    res.status(403).json({
      success: false,
      error: "Missing origin header",
    });
    return;
  }

  const isAllowed = config.corsOrigins.some((allowed) =>
    origin.startsWith(allowed),
  );

  if (!isAllowed) {
    res.status(403).json({
      success: false,
      error: "Origin not allowed",
    });
    return;
  }

  next();
}

// Request sanitizer - prevent XSS and injection
export function sanitizeRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (req.body && typeof req.body === "object") {
    sanitizeObject(req.body);
  }
  next();
}

function sanitizeObject(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === "string") {
      // Remove potential script tags and dangerous patterns
      obj[key] = value
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "");
    } else if (typeof value === "object" && value !== null) {
      sanitizeObject(value as Record<string, unknown>);
    }
  }
}

// Security headers middleware
export function securityHeaders(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Content Security Policy
  res.setHeader("Content-Security-Policy", "default-src 'self'");

  next();
}
