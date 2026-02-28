/** Validates Bearer token against the API_KEY secret. Returns true if authorized. */
export function isAuthorized(request: Request, apiKey: string): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  return authHeader.slice(7) === apiKey;
}
