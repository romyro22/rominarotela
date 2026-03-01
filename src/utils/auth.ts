const encoder = new TextEncoder();

// Workers-specific: crypto.subtle.timingSafeEqual is not part of the standard Web Crypto API
const subtle = crypto.subtle as SubtleCrypto & {
  timingSafeEqual(a: ArrayBuffer, b: ArrayBuffer): boolean;
};

/**
 * Compares two strings in constant time using SHA-256 hashing.
 * Hashing ensures equal-length buffers (32 bytes) regardless of input length,
 * preventing length-based timing side-channels.
 */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  return subtle.timingSafeEqual(hashA, hashB);
}

/** Validates Bearer token against the API_KEY secret using timing-safe comparison. */
export async function isAuthorized(request: Request, apiKey: string): Promise<boolean> {
  if (!apiKey) return false;
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  return timingSafeEqual(authHeader.slice(7), apiKey);
}
