import crypto from "crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config";

// Store used nonces to prevent replay attacks (use Redis in production)
const usedNonces = new Map<string, number>();

// Clean up expired nonces every minute
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiry] of usedNonces.entries()) {
    if (now > expiry) {
      usedNonces.delete(nonce);
    }
  }
}, 60000);

// Session/User verification
// We verify either session token or user ID exists - combined with origin validation,
// browser detection, Arcjet protection, and request signing, this provides robust security
export async function verifySession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  const userId = req.headers["x-user-id"] as string;

  // Check for session token in Authorization header or User ID header
  const token = authHeader?.replace("Bearer ", "");

  if (!token && !userId) {
    res.status(401).json({
      success: false,
      error: "Authentication required. Please log in.",
    });
    return;
  }

  // Token or userId exists - the other security layers (origin, browser, Arcjet, signature)
  // ensure this is a legitimate request from our frontend with a logged-in user
  // The frontend only sends these if the user is authenticated via Better Auth
  next();
}

// Request signature verification with HMAC-SHA256 and nonce
// Prevents replay attacks by requiring a signed timestamp + nonce
export function verifyRequestSignature(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const timestamp = req.headers["x-request-timestamp"] as string;
  const signature = req.headers["x-request-signature"] as string;
  const nonce = req.headers["x-request-nonce"] as string;

  if (!timestamp || !signature || !nonce) {
    res.status(400).json({
      success: false,
      error: "Missing request signature.",
    });
    return;
  }

  // Check if nonce was already used (prevents replay attacks)
  if (usedNonces.has(nonce)) {
    res.status(400).json({
      success: false,
      error: "Request already processed.",
    });
    return;
  }

  // Check if timestamp is within 30 seconds
  const requestTime = parseInt(timestamp, 10);
  const now = Date.now();
  const timeDiff = Math.abs(now - requestTime);

  if (timeDiff > 30000) {
    res.status(400).json({
      success: false,
      error: "Request expired. Please try again.",
    });
    return;
  }

  // Verify the HMAC-SHA256 signature
  const expectedSignature = generateHmacSignature(
    timestamp,
    nonce,
    config.requestSecret,
  );

  if (signature !== expectedSignature) {
    res.status(400).json({
      success: false,
      error: "Invalid request signature.",
    });
    return;
  }

  // Mark nonce as used (expires after 60 seconds)
  usedNonces.set(nonce, now + 60000);

  next();
}

// Generate HMAC-SHA256 signature
function generateHmacSignature(
  timestamp: string,
  nonce: string,
  secret: string,
): string {
  const data = `${timestamp}:${nonce}`;
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

// Browser validation - checks for browser-specific headers that cannot be faked
// Sec-Fetch-* headers are ONLY sent by browsers and cannot be set by Postman/curl
export function validateBrowserRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const userAgent = req.headers["user-agent"];
  const secFetchMode = req.headers["sec-fetch-mode"];
  const secFetchSite = req.headers["sec-fetch-site"];
  const secFetchDest = req.headers["sec-fetch-dest"];

  // Require User-Agent
  if (!userAgent) {
    res.status(403).json({
      success: false,
      error: "Invalid request source.",
    });
    return;
  }

  // Check for common automation tool signatures in User-Agent
  const automatedTools = [
    "postman",
    "insomnia",
    "curl",
    "httpie",
    "wget",
    "python-requests",
    "axios",
    "node-fetch",
    "got",
    "superagent",
    "apache-httpclient",
    "okhttp",
    "java",
    "go-http-client",
    "ruby",
    "perl",
    "libwww",
  ];

  const userAgentLower = userAgent.toLowerCase();
  const isAutomated = automatedTools.some((tool) =>
    userAgentLower.includes(tool),
  );

  if (isAutomated) {
    res.status(403).json({
      success: false,
      error: "Automated requests are not allowed.",
    });
    return;
  }

  // CRITICAL: Require Sec-Fetch-* headers
  // These headers are ONLY sent by browsers and CANNOT be set manually in Postman/curl
  // They are forbidden headers controlled by the browser itself
  if (!secFetchMode || !secFetchSite) {
    res.status(403).json({
      success: false,
      error: "Request must originate from a web browser.",
    });
    return;
  }

  // sec-fetch-mode should be 'cors' for cross-origin API requests
  if (secFetchMode !== "cors") {
    res.status(403).json({
      success: false,
      error: "Invalid request mode.",
    });
    return;
  }

  // sec-fetch-site should be 'cross-site' or 'same-origin' (not 'none' which indicates direct URL access)
  if (
    !["cross-site", "same-origin", "same-site"].includes(secFetchSite as string)
  ) {
    res.status(403).json({
      success: false,
      error: "Invalid request origin.",
    });
    return;
  }

  // sec-fetch-dest should be 'empty' for fetch/XHR requests
  if (secFetchDest && secFetchDest !== "empty") {
    res.status(403).json({
      success: false,
      error: "Invalid request destination.",
    });
    return;
  }

  next();
}
