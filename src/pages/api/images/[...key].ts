import type { APIContext } from "astro";
import { getImage } from "../../../services/image-service";
import { jsonError } from "../../../utils/response";

const ONE_YEAR_SECONDS = 31536000;

/** GET /api/images/* — Serve image from R2. Public. Cache-Control 1 year. ETag support. */
export async function GET(context: APIContext): Promise<Response> {
  const runtime = context.locals.runtime;
  const { STORAGE } = runtime.env;
  const key = context.params.key;

  if (!key) {
    return jsonError("MISSING_KEY", "Image key is required", 400);
  }

  const object = await getImage(STORAGE, key);

  if (!object) {
    return jsonError("NOT_FOUND", `Image '${key}' not found`, 404);
  }

  const ifNoneMatch = context.request.headers.get("If-None-Match");
  if (ifNoneMatch && object.etag === ifNoneMatch) {
    return new Response(null, { status: 304 });
  }

  const headers = new Headers();
  headers.set("Content-Type", object.httpMetadata?.contentType ?? "application/octet-stream");
  headers.set("Cache-Control", `public, max-age=${ONE_YEAR_SECONDS}, immutable`);
  headers.set("ETag", object.etag);

  if (object.size !== undefined) {
    headers.set("Content-Length", String(object.size));
  }

  return new Response(object.body, { status: 200, headers });
}
