import cors from "cors";
import express, { Express } from "express";
import { config, validateEnv } from "./config";
import { sanitizeRequest, securityHeaders } from "./middleware/security";
import routes from "./routes";

// Validate environment variables
validateEnv();

const app: Express = express();

// Trust proxy for proper IP detection behind reverse proxies (AWS ALB, CloudFront, etc.)
app.set("trust proxy", 1);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // In production, always require origin
      if (!origin) {
        callback(new Error("No origin provided"), false);
        return;
      }

      const isAllowed = config.corsOrigins.some((allowed) =>
        origin.startsWith(allowed),
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Request-Timestamp",
      "X-Request-Signature",
      "X-Request-Nonce",
      "X-User-Id",
    ],
    exposedHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
    ],
    maxAge: 86400, // 24 hours
  }),
);

// Security headers
app.use(securityHeaders);

// Body parsing with size limits
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Sanitize incoming requests
app.use(sanitizeRequest);

// API routes
app.use("/api", routes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    name: "AI Text Summarizer API",
    version: "1.0.0",
    status: "running",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
  });
});

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);

    res.status(500).json({
      success: false,
      error:
        config.nodeEnv === "development"
          ? err.message
          : "Internal server error",
    });
  },
);

// Only start server in development (Lambda uses the exported app)
if (config.nodeEnv !== "production") {
  app.listen(config.port, () => {
    console.log(`🚀 API server running on http://localhost:${config.port}`);
    console.log(`📝 Environment: ${config.nodeEnv}`);
  });
}

export default app;
