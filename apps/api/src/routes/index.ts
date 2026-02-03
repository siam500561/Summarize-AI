import { Router, type Router as RouterType } from "express";
import { handleHealthCheck, handleSummarize } from "../controllers/summarize";
import { rateLimiter, validateOrigin } from "../middleware/security";
import { validateSummarizeRequest } from "../middleware/validation";

const router: RouterType = Router();

// Health check - no rate limiting
router.get("/health", handleHealthCheck);

// Summarize endpoint with all security middleware
router.post(
  "/summarize",
  validateOrigin,
  rateLimiter,
  validateSummarizeRequest,
  handleSummarize,
);

export default router;
