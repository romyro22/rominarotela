import type { APIContext } from "astro";
import {
  createArtwork,
  getAllArtworks,
  getArtworksByTechnique,
} from "../../../services/artwork-service";
import { getCachedOrFetch, invalidateArtworkCache } from "../../../services/cache-service";
import type { CreateArtworkInput } from "../../../types/artwork";
import { isAuthorized } from "../../../utils/auth";
import { jsonError, jsonSuccess } from "../../../utils/response";

/** GET /api/artworks — List all artworks. Supports ?technique= filter. Cached via KV. */
export async function GET(context: APIContext): Promise<Response> {
  const runtime = context.locals.runtime;
  const { DB, CACHE } = runtime.env;
  const technique = context.url.searchParams.get("technique");

  if (technique) {
    const cacheKey = `artworks:technique:${technique}`;
    const artworks = await getCachedOrFetch(CACHE, cacheKey, () =>
      getArtworksByTechnique(DB, technique),
    );
    return jsonSuccess(artworks);
  }

  const artworks = await getCachedOrFetch(CACHE, "artworks:all", () => getAllArtworks(DB));
  return jsonSuccess(artworks);
}

const REQUIRED_FIELDS: (keyof CreateArtworkInput)[] = [
  "id",
  "nameEs",
  "nameEn",
  "descriptionEs",
  "descriptionEn",
  "size",
  "techniqueEs",
  "techniqueEn",
  "imageKey",
];

/** POST /api/artworks — Create a new artwork. Requires Bearer auth. Invalidates cache. */
export async function POST(context: APIContext): Promise<Response> {
  const runtime = context.locals.runtime;
  const { DB, CACHE, API_KEY } = runtime.env;

  if (!isAuthorized(context.request, API_KEY)) {
    return jsonError("UNAUTHORIZED", "Valid Bearer token is required", 401);
  }

  let body: unknown;
  try {
    body = await context.request.json();
  } catch {
    return jsonError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  if (typeof body !== "object" || body === null) {
    return jsonError("INVALID_BODY", "Request body must be a JSON object", 400);
  }

  const input = body as Record<string, unknown>;
  const missingFields = REQUIRED_FIELDS.filter(
    (field) => input[field] === undefined || input[field] === "",
  );

  if (missingFields.length > 0) {
    return jsonError("MISSING_FIELDS", `Missing required fields: ${missingFields.join(", ")}`, 400);
  }

  const artworkInput = input as unknown as CreateArtworkInput;

  try {
    const artwork = await createArtwork(DB, artworkInput);
    await invalidateArtworkCache(CACHE);
    return jsonSuccess(artwork, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create artwork";
    console.log(
      JSON.stringify({
        event: "artwork.create.failed",
        errorMessage: message,
        fixSuggestion: "Check D1 binding and input data for constraint violations",
      }),
    );
    return jsonError("CREATE_FAILED", message, 500);
  }
}
