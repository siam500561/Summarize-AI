import { Router, type Router as RouterType } from "express";
import { handleHealthCheck, handleSummarize } from "../controllers/summarize";
import { arcjetProtect } from "../middleware/arcjet";
import {
  validateBrowserRequest,
  verifyRequestSignature,
  verifySession,
} from "../middleware/auth";
import { validateOrigin } from "../middleware/security";
import { validateSummarizeRequest } from "../middleware/validation";

const router: RouterType = Router();

// Health check - no security middleware
router.get("/health", handleHealthCheck);

// Summarize endpoint with full security stack:
// 1. validateOrigin - Check CORS origin
// 2. validateBrowserRequest - Block Postman/curl/scripts
// 3. arcjetProtect - Rate limiting + bot detection + shield
// 4. verifySession - Ensure user is logged in
// 5. verifyRequestSignature - Prevent replay attacks
// 6. validateSummarizeRequest - Validate request body
router.post(
  "/summarize",
  validateOrigin,
  validateBrowserRequest,
  arcjetProtect,
  verifySession,
  verifyRequestSignature,
  validateSummarizeRequest,
  handleSummarize,
);

export default router;
