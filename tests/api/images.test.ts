import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "../../src/pages/api/images/[...key]";
import { POST } from "../../src/pages/api/images/upload";
import type { ApiError, ApiSuccess } from "../../src/types/api";
import { createMockContext, createUploadContext } from "../helpers/mock-context";

/** Creates a minimal JPEG file (valid magic bytes + minimal JFIF structure). */
function createJpegBlob(sizeBytes = 100): File {
  const buffer = new Uint8Array(sizeBytes);
  buffer[0] = 0xff;
  buffer[1] = 0xd8;
  buffer[2] = 0xff;
  buffer[3] = 0xe0;
  return new File([buffer], "test-image.jpg", { type: "image/jpeg" });
}

/** Creates a PNG file (valid magic bytes). */
function createPngBlob(sizeBytes = 100): File {
  const buffer = new Uint8Array(sizeBytes);
  buffer[0] = 0x89;
  buffer[1] = 0x50;
  buffer[2] = 0x4e;
  buffer[3] = 0x47;
  return new File([buffer], "test-image.png", { type: "image/png" });
}

/** Creates a WebP file (RIFF + WEBP magic bytes at offset 8). */
function createWebpBlob(sizeBytes = 100): File {
  const buffer = new Uint8Array(sizeBytes);
  // RIFF header (bytes 0-3)
  buffer[0] = 0x52;
  buffer[1] = 0x49;
  buffer[2] = 0x46;
  buffer[3] = 0x46;
  // File size placeholder (bytes 4-7)
  buffer[4] = 0x00;
  buffer[5] = 0x00;
  buffer[6] = 0x00;
  buffer[7] = 0x00;
  // WEBP marker (bytes 8-11)
  buffer[8] = 0x57;
  buffer[9] = 0x45;
  buffer[10] = 0x42;
  buffer[11] = 0x50;
  return new File([buffer], "test-image.webp", { type: "image/webp" });
}

/** Creates a GIF file (valid magic bytes GIF89a). */
function createGifBlob(sizeBytes = 100): File {
  const buffer = new Uint8Array(sizeBytes);
  buffer[0] = 0x47;
  buffer[1] = 0x49;
  buffer[2] = 0x46;
  buffer[3] = 0x38;
  buffer[4] = 0x39;
  buffer[5] = 0x61;
  return new File([buffer], "test-image.gif", { type: "image/gif" });
}

/** Creates a file with invalid magic bytes (plain text disguised as image). */
function createFakeImageBlob(): File {
  const encoder = new TextEncoder();
  const data = encoder.encode("this is not an image file at all");
  return new File([data], "fake.jpg", { type: "image/jpeg" });
}

describe("POST /api/images/upload", () => {
  it("should upload valid JPEG image with auth", async () => {
    const ctx = createUploadContext({ file: createJpegBlob(), artworkId: "art-test" });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiSuccess<{
      key: string;
      size: number;
      contentType: string;
    }>;

    expect(response.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.key).toMatch(/^artworks\/art-test\//);
    expect(body.data.contentType).toBe("image/jpeg");
  });

  it("should return 401 without auth", async () => {
    const ctx = createUploadContext({
      file: createJpegBlob(),
      artworkId: "art-test",
      authenticated: false,
    });
    const response = await POST(ctx);

    expect(response.status).toBe(401);
  });

  it("should return 400 without file in FormData", async () => {
    const ctx = createUploadContext({ artworkId: "art-test" });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("MISSING_FILE");
  });

  it("should return 400 for invalid artworkId (path traversal attempt)", async () => {
    const ctx = createUploadContext({
      file: createJpegBlob(),
      artworkId: "../../secrets/config",
    });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_ARTWORK_ID");
  });

  it("should return 400 without artworkId field", async () => {
    const ctx = createUploadContext({ file: createJpegBlob() });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("MISSING_ARTWORK_ID");
  });

  it("should return 400 when file exceeds max size", async () => {
    const ctx = createUploadContext({
      file: createJpegBlob(10 * 1024 * 1024 + 1),
      artworkId: "art-test",
    });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("FILE_TOO_LARGE");
  });

  it("should return 400 when magic bytes don't match declared MIME", async () => {
    const ctx = createUploadContext({ file: createFakeImageBlob(), artworkId: "art-test" });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_FILE_TYPE");
  });

  it("should upload valid PNG and derive extension from magic bytes", async () => {
    const ctx = createUploadContext({ file: createPngBlob(), artworkId: "art-png" });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiSuccess<{ key: string; contentType: string }>;

    expect(response.status).toBe(201);
    expect(body.data.key).toMatch(/\.png$/);
    expect(body.data.contentType).toBe("image/png");
  });

  it("should upload valid WebP with RIFF+WEBP magic bytes", async () => {
    const ctx = createUploadContext({ file: createWebpBlob(), artworkId: "art-webp" });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiSuccess<{ key: string; contentType: string }>;

    expect(response.status).toBe(201);
    expect(body.data.key).toMatch(/\.webp$/);
    expect(body.data.contentType).toBe("image/webp");
  });

  it("should upload valid GIF", async () => {
    const ctx = createUploadContext({ file: createGifBlob(), artworkId: "art-gif" });
    const response = await POST(ctx);
    const body = (await response.json()) as ApiSuccess<{ key: string; contentType: string }>;

    expect(response.status).toBe(201);
    expect(body.data.key).toMatch(/\.gif$/);
    expect(body.data.contentType).toBe("image/gif");
  });
});

describe("GET /api/images/:key", () => {
  beforeEach(async () => {
    // Setup R2 objects in beforeEach (outside test isolation frame) to avoid
    // vitest-pool-workers R2 isolated storage pop failures.
    await env.STORAGE.put(
      "artworks/art-1/img.png",
      new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x00, 0x01]),
      { httpMetadata: { contentType: "image/png" } },
    );
    await env.STORAGE.put(
      "artworks/art-1/etag-test.jpg",
      new Uint8Array([0xff, 0xd8, 0xff, 0xe0]),
      { httpMetadata: { contentType: "image/jpeg" } },
    );
  });

  it("should serve image from R2 with correct Content-Type", async () => {
    const ctx = createMockContext({
      url: "https://example.com/api/images/artworks/art-1/img.png",
      params: { key: "artworks/art-1/img.png" },
    });
    const response = await GET(ctx);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/png");
    expect(response.headers.get("Cache-Control")).toContain("immutable");
    expect(response.headers.get("ETag")).toBeTruthy();

    // Consume body to release R2 object reference
    await response.arrayBuffer();
  });

  it("should return 404 for non-existent image", async () => {
    const ctx = createMockContext({
      url: "https://example.com/api/images/artworks/art-99/img.png",
      params: { key: "artworks/art-99/img.png" },
    });
    const response = await GET(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("should return 400 for invalid key format (path traversal)", async () => {
    const ctx = createMockContext({
      url: "https://example.com/api/images/../../secrets/config",
      params: { key: "../../secrets/config" },
    });
    const response = await GET(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("INVALID_KEY");
  });

  it("should include ETag header in response", async () => {
    const ctx = createMockContext({
      url: "https://example.com/api/images/artworks/art-1/etag-test.jpg",
      params: { key: "artworks/art-1/etag-test.jpg" },
    });
    const response = await GET(ctx);

    expect(response.status).toBe(200);
    expect(response.headers.get("ETag")).toBeTruthy();
    expect(response.headers.get("Cache-Control")).toContain("max-age=31536000");

    // Consume body to release R2 object reference
    await response.arrayBuffer();
  });

  it("should return 400 without key param", async () => {
    const ctx = createMockContext({
      url: "https://example.com/api/images/",
      params: {},
    });
    const response = await GET(ctx);
    const body = (await response.json()) as ApiError;

    expect(response.status).toBe(400);
    expect(body.error.code).toBe("MISSING_KEY");
  });
});
