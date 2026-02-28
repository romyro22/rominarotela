import type { APIContext } from "astro";
import { uploadImage } from "../../../services/image-service";
import { isAuthorized } from "../../../utils/auth";
import { jsonError, jsonSuccess } from "../../../utils/response";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/** PNG, JPEG, GIF, WEBP magic byte signatures. */
const MAGIC_BYTES: Array<{ mime: string; bytes: number[] }> = [
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

/** Detects MIME type from file's magic bytes. Returns null if unrecognized. */
function detectMimeFromBytes(buffer: ArrayBuffer): string | null {
  const header = new Uint8Array(buffer, 0, Math.min(12, buffer.byteLength));
  for (const sig of MAGIC_BYTES) {
    if (sig.bytes.every((b, i) => header[i] === b)) {
      return sig.mime;
    }
  }
  return null;
}

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

  if (!SAFE_ID_PATTERN.test(artworkId)) {
    return jsonError(
      "INVALID_ARTWORK_ID",
      "artworkId must contain only alphanumeric characters, hyphens, and underscores",
      400,
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return jsonError("FILE_TOO_LARGE", "File exceeds maximum size of 10 MB", 400);
  }

  const arrayBuffer = await file.arrayBuffer();

  const detectedMime = detectMimeFromBytes(arrayBuffer);
  if (!detectedMime || !(detectedMime in ALLOWED_MIME_TYPES)) {
    return jsonError(
      "INVALID_FILE_TYPE",
      "File must be a valid image (JPEG, PNG, WebP, or GIF)",
      400,
    );
  }

  const extension = ALLOWED_MIME_TYPES[detectedMime];
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const baseName = sanitizedFilename.replace(/\.[^.]+$/, "");
  const finalFilename = baseName ? `${baseName}${extension}` : `upload${extension}`;
  const key = `artworks/${artworkId}/${finalFilename}`;

  try {
    await uploadImage(STORAGE, key, arrayBuffer, detectedMime);

    console.log(
      JSON.stringify({
        event: "image.upload.success",
        key,
        artworkId,
        size: file.size,
        contentType: detectedMime,
      }),
    );

    return jsonSuccess({ key, size: file.size, contentType: detectedMime }, 201);
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
    return jsonError("UPLOAD_FAILED", "Failed to upload image", 500);
  }
}
