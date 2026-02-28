import type { APIContext } from "astro";
import { uploadImage } from "../../../services/image-service";
import { isAuthorized } from "../../../utils/auth";
import { jsonError, jsonSuccess } from "../../../utils/response";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/** POST /api/images/upload — Upload image via multipart FormData. Requires Bearer auth. */
export async function POST(context: APIContext): Promise<Response> {
  const runtime = context.locals.runtime;
  const { STORAGE, API_KEY } = runtime.env;

  if (!isAuthorized(context.request, API_KEY)) {
    return jsonError("UNAUTHORIZED", "Valid Bearer token is required", 401);
  }

  let formData: FormData;
  try {
    formData = await context.request.formData();
  } catch {
    return jsonError("INVALID_FORM", "Request must be multipart/form-data", 400);
  }

  const file = formData.get("file");
  const artworkId = formData.get("artworkId");

  if (!file || !(file instanceof File)) {
    return jsonError("MISSING_FILE", "A 'file' field with a valid file is required", 400);
  }

  if (!artworkId || typeof artworkId !== "string") {
    return jsonError("MISSING_ARTWORK_ID", "An 'artworkId' string field is required", 400);
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError("FILE_TOO_LARGE", `File exceeds maximum size of ${MAX_FILE_SIZE} bytes`, 400);
  }

  const contentType = file.type || "application/octet-stream";
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `artworks/${artworkId}/${sanitizedFilename}`;

  try {
    const arrayBuffer = await file.arrayBuffer();
    await uploadImage(STORAGE, key, arrayBuffer, contentType);

    console.log(
      JSON.stringify({
        event: "image.upload.success",
        key,
        artworkId,
        size: file.size,
        contentType,
      }),
    );

    return jsonSuccess({ key, size: file.size, contentType }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload image";
    console.log(
      JSON.stringify({
        event: "image.upload.failed",
        artworkId,
        errorMessage: message,
        fixSuggestion: "Check R2 binding in wrangler.jsonc",
      }),
    );
    return jsonError("UPLOAD_FAILED", message, 500);
  }
}
