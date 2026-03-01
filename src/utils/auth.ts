const encoder = new TextEncoder();

/** Compares two strings in constant time to prevent timing attacks. */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  if (bufA.byteLength !== bufB.byteLength) return false;
  const subtle = crypto.subtle as SubtleCrypto & {
    timingSafeEqual(a: ArrayBufferView, b: ArrayBufferView): boolean;
  };
  return subtle.timingSafeEqual(bufA, bufB);
}

/** Validates Bearer token against the API_KEY secret using timing-safe comparison. */
export function isAuthorized(request: Request, apiKey: string): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  return timingSafeEqual(authHeader.slice(7), apiKey);
}
