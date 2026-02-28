import type { APIContext } from "astro";
import { deleteArtwork, getArtworkById, updateArtwork } from "../../../services/artwork-service";
import { getCachedOrFetch, invalidateArtworkCache } from "../../../services/cache-service";
import { deleteImage, listArtworkImages } from "../../../services/image-service";
import type { UpdateArtworkInput } from "../../../types/artwork";
import { isAuthorized } from "../../../utils/auth";
import { jsonError, jsonSuccess } from "../../../utils/response";

/** GET /api/artworks/:id — Get a single artwork by ID. Cached via KV. */
export async function GET(context: APIContext): Promise<Response> {
  const runtime = context.locals.runtime;
  const { DB, CACHE } = runtime.env;
  const artworkId = context.params.id;

  if (!artworkId) {
    return jsonError("MISSING_ID", "Artwork ID is required", 400);
  }

  const cacheKey = `artwork:${artworkId}`;
  const artwork = await getCachedOrFetch(CACHE, cacheKey, () => getArtworkById(DB, artworkId));

  if (!artwork) {
    return jsonError("NOT_FOUND", `Artwork '${artworkId}' not found`, 404);
  }

  return jsonSuccess(artwork);
}

/** PUT /api/artworks/:id — Update an artwork. Requires Bearer auth. Invalidates cache. */
export async function PUT(context: APIContext): Promise<Response> {
  const runtime = context.locals.runtime;
  const { DB, CACHE, API_KEY } = runtime.env;
  const artworkId = context.params.id;

  if (!artworkId) {
    return jsonError("MISSING_ID", "Artwork ID is required", 400);
  }

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

  const input = body as UpdateArtworkInput;

  try {
    const updated = await updateArtwork(DB, artworkId, input);
    if (!updated) {
      return jsonError("NOT_FOUND", `Artwork '${artworkId}' not found`, 404);
    }
    await invalidateArtworkCache(CACHE, artworkId);
    return jsonSuccess(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update artwork";
    console.log(
      JSON.stringify({
        event: "artwork.update.failed",
        artworkId,
        errorMessage: message,
        fixSuggestion: "Check D1 binding and input data for constraint violations",
      }),
    );
    return jsonError("UPDATE_FAILED", message, 500);
  }
}

/** DELETE /api/artworks/:id — Delete artwork and its R2 images. Requires auth. Invalidates cache. */
export async function DELETE(context: APIContext): Promise<Response> {
  const runtime = context.locals.runtime;
  const { DB, CACHE, STORAGE, API_KEY } = runtime.env;
  const artworkId = context.params.id;

  if (!artworkId) {
    return jsonError("MISSING_ID", "Artwork ID is required", 400);
  }

  if (!isAuthorized(context.request, API_KEY)) {
    return jsonError("UNAUTHORIZED", "Valid Bearer token is required", 401);
  }

  try {
    const imageKeys = await listArtworkImages(STORAGE, artworkId);
    for (const imageKey of imageKeys) {
      await deleteImage(STORAGE, imageKey);
    }

    const deleted = await deleteArtwork(DB, artworkId);
    if (!deleted) {
      return jsonError("NOT_FOUND", `Artwork '${artworkId}' not found`, 404);
    }

    await invalidateArtworkCache(CACHE, artworkId);

    console.log(
      JSON.stringify({
        event: "artwork.delete.success",
        artworkId,
        imagesDeleted: imageKeys.length,
      }),
    );

    return jsonSuccess({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete artwork";
    console.log(
      JSON.stringify({
        event: "artwork.delete.failed",
        artworkId,
        errorMessage: message,
        fixSuggestion: "Check D1 and R2 bindings",
      }),
    );
    return jsonError("DELETE_FAILED", message, 500);
  }
}
