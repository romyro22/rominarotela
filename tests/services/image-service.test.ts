import { env } from "cloudflare:test";
import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteImage,
  getImage,
  listArtworkImages,
  uploadImage,
} from "../../src/services/image-service";

describe("ImageService", () => {
  // R2 setup in beforeEach to avoid isolated storage pop failures
  beforeEach(async () => {
    await env.STORAGE.put("artworks/art-1/photo.jpg", new Uint8Array([0xff, 0xd8]), {
      httpMetadata: { contentType: "image/jpeg" },
    });
    await env.STORAGE.put("artworks/art-1/sketch.png", new Uint8Array([0x89, 0x50]), {
      httpMetadata: { contentType: "image/png" },
    });
  });

  it("should upload image to R2 and return key", async () => {
    const key = await uploadImage(
      env.STORAGE,
      "artworks/art-2/test.jpg",
      new Uint8Array([0xff]).buffer,
      "image/jpeg",
    );

    expect(key).toBe("artworks/art-2/test.jpg");
  });

  it("should get image from R2", async () => {
    const obj = await getImage(env.STORAGE, "artworks/art-1/photo.jpg");

    expect(obj).not.toBeNull();
    await obj?.arrayBuffer();
  });

  it("should return null for non-existent image", async () => {
    const obj = await getImage(env.STORAGE, "artworks/art-99/nope.jpg");

    expect(obj).toBeNull();
  });

  it("should delete image from R2", async () => {
    await deleteImage(env.STORAGE, "artworks/art-1/photo.jpg");
  });

  it("should list all images for an artwork", async () => {
    const keys = await listArtworkImages(env.STORAGE, "art-1");

    expect(keys).toHaveLength(2);
    expect(keys).toContain("artworks/art-1/photo.jpg");
    expect(keys).toContain("artworks/art-1/sketch.png");
  });

  it("should return empty array when artwork has no images", async () => {
    const keys = await listArtworkImages(env.STORAGE, "art-nonexistent");

    expect(keys).toHaveLength(0);
  });
});
