import type { ApiError, ApiSuccess } from "../types/api";

/** Build a success JSON response. */
export function jsonSuccess<T>(data: T, status = 200): Response {
  const body: ApiSuccess<T> = { success: true, data };
  return Response.json(body, { status });
}

/** Build an error JSON response. */
export function jsonError(code: string, message: string, status = 400): Response {
  const body: ApiError = { success: false, error: { code, message } };
  return Response.json(body, { status });
}
