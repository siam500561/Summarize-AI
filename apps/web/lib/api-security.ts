// Generate request signature for API security
// This prevents replay attacks by signing each request with a timestamp + nonce

const REQUEST_SECRET =
  process.env.NEXT_PUBLIC_REQUEST_SECRET || "dev-secret-change-in-production";

// Generate a random nonce for one-time use
function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

// Generate HMAC-SHA256 signature using Web Crypto API
async function generateHmacSignature(
  timestamp: string,
  nonce: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const data = `${timestamp}:${nonce}`;

  // Import the secret key
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(REQUEST_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  // Sign the data
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));

  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function generateRequestSignature(): Promise<{
  timestamp: string;
  signature: string;
  nonce: string;
}> {
  const timestamp = Date.now().toString();
  const nonce = generateNonce();
  const signature = await generateHmacSignature(timestamp, nonce);

  return { timestamp, signature, nonce };
}

// Get session token from cookies
// Note: Better Auth cookies might be HttpOnly, so we also accept passing session directly
export function getSessionToken(): string | null {
  if (typeof document === "undefined") return null;

  const cookies = document.cookie.split(";");

  // Try different cookie names that Better Auth might use
  const possibleNames = [
    "better-auth.session_token",
    "better-auth.session",
    "__session",
    "session",
  ];

  for (const name of possibleNames) {
    const cookie = cookies.find((c) => c.trim().startsWith(`${name}=`));
    if (cookie) {
      const value = cookie.split("=").slice(1).join("=").trim();
      if (value) return value;
    }
  }

  return null;
}

// Create headers for authenticated API requests
// Pass userId when session token cookie is HttpOnly
export async function createAuthHeaders(userId?: string): Promise<HeadersInit> {
  const { timestamp, signature, nonce } = await generateRequestSignature();
  const sessionToken = getSessionToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-Request-Timestamp": timestamp,
    "X-Request-Signature": signature,
    "X-Request-Nonce": nonce,
  };

  // Use session token if available, otherwise use userId
  if (sessionToken) {
    headers["Authorization"] = `Bearer ${sessionToken}`;
  } else if (userId) {
    headers["X-User-Id"] = userId;
  }

  return headers;
}
