import type { APIContext } from "astro";
import { getImage } from "../../../services/image-service";
import { jsonError } from "../../../utils/response";

const ONE_YEAR_SECONDS = 31536000;
const SAFE_KEY_PATTERN = /^artworks\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+$/;

/** Strips surrounding quotes from an ETag value per HTTP spec. */
function normalizeEtag(etag: string): string {
  return etag.replace(/^"|"$/g, "");
}

/** GET /api/images/* — Serve image from R2. Public. Cache-Control 1 year. ETag support. */
export async function GET(context: APIContext): Promise<Response> {
  const runtime = context.locals.runtime;
  const { STORAGE } = runtime.env;
  const key = context.params.key;

  if (!key) {
    return jsonError("MISSING_KEY", "Image key is required", 400);
  }

  if (!SAFE_KEY_PATTERN.test(key)) {
    return jsonError("INVALID_KEY", "Invalid image key format", 400);
  }

  try {
    const object = await getImage(STORAGE, key);

    if (!object) {
      return jsonError("NOT_FOUND", "Image not found", 404);
    }

    const ifNoneMatch = context.request.headers.get("If-None-Match");
    if (ifNoneMatch && normalizeEtag(object.etag) === normalizeEtag(ifNoneMatch)) {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown R2 error";
    console.log(
      JSON.stringify({
        event: "image.serve.failed",
        errorMessage: message,
        fixSuggestion: "Check R2 binding and bucket access",
      }),
    );
    return jsonError("FETCH_FAILED", "Failed to retrieve image", 500);
  }
}
