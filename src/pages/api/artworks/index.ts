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

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

/** GET /api/artworks — List all artworks. Supports ?technique= filter. Cached via KV. */
export async function GET(context: APIContext): Promise<Response> {
  const runtime = context.locals.runtime;
  const { DB, CACHE } = runtime.env;
  const technique = context.url.searchParams.get("technique");

  try {
    if (technique) {
      const cacheKey = `artworks:technique:${encodeURIComponent(technique)}`;
      const artworks = await getCachedOrFetch(CACHE, cacheKey, () =>
        getArtworksByTechnique(DB, technique),
      );
      return jsonSuccess(artworks);
    }

    const artworks = await getCachedOrFetch(CACHE, "artworks:all", () => getAllArtworks(DB));
    return jsonSuccess(artworks);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(
      JSON.stringify({
        event: "artworks.list.failed",
        errorMessage: message,
        fixSuggestion: "Check D1 and KV bindings",
      }),
    );
    return jsonError("FETCH_FAILED", "Failed to retrieve artworks", 500);
  }
}

const REQUIRED_STRING_FIELDS = [
  "id",
  "nameEs",
  "nameEn",
  "descriptionEs",
  "descriptionEn",
  "size",
  "techniqueEs",
  "techniqueEn",
  "imageKey",
] as const;

/** Validates and extracts a CreateArtworkInput from raw body. Returns null if invalid. */
function validateCreateInput(body: Record<string, unknown>): CreateArtworkInput | null {
  for (const field of REQUIRED_STRING_FIELDS) {
    if (typeof body[field] !== "string" || body[field] === "") return null;
  }

  const optionalStringFields = [
    "longDescriptionEs",
    "longDescriptionEn",
    "inspirationEs",
    "inspirationEn",
    "materialsEs",
    "materialsEn",
  ] as const;

  for (const field of optionalStringFields) {
    if (field in body && typeof body[field] !== "string") return null;
  }

  if ("sortOrder" in body && typeof body.sortOrder !== "number") return null;

  if ("tags" in body) {
    if (!Array.isArray(body.tags) || !body.tags.every((t) => typeof t === "string")) return null;
  }

  return {
    id: body.id as string,
    nameEs: body.nameEs as string,
    nameEn: body.nameEn as string,
    descriptionEs: body.descriptionEs as string,
    descriptionEn: body.descriptionEn as string,
    size: body.size as string,
    techniqueEs: body.techniqueEs as string,
    techniqueEn: body.techniqueEn as string,
    imageKey: body.imageKey as string,
    longDescriptionEs: body.longDescriptionEs as string | undefined,
    longDescriptionEn: body.longDescriptionEn as string | undefined,
    inspirationEs: body.inspirationEs as string | undefined,
    inspirationEn: body.inspirationEn as string | undefined,
    materialsEs: body.materialsEs as string | undefined,
    materialsEn: body.materialsEn as string | undefined,
    tags: body.tags as string[] | undefined,
    sortOrder: body.sortOrder as number | undefined,
  };
}

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

  const artworkInput = validateCreateInput(body as Record<string, unknown>);
  if (!artworkInput) {
    return jsonError(
      "INVALID_FIELDS",
      `Missing or invalid required fields: ${REQUIRED_STRING_FIELDS.join(", ")}`,
      400,
    );
  }

  if (!SAFE_ID_PATTERN.test(artworkInput.id)) {
    return jsonError(
      "INVALID_ID",
      "Artwork ID must contain only alphanumeric characters, hyphens, and underscores",
      400,
    );
  }

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
    return jsonError("CREATE_FAILED", "Failed to create artwork", 500);
  }
}
