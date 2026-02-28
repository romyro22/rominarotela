import { env } from "cloudflare:test";
import { describe, expect, it } from "vitest";
import {
  getCachedOrFetch,
  invalidateArtworkCache,
  invalidateCache,
} from "../../src/services/cache-service";

describe("CacheService", () => {
  it("should call fetchFn and cache result on miss", async () => {
    let callCount = 0;
    const fetchFn = async () => {
      callCount++;
      return { value: "fresh-data" };
    };

    const result = await getCachedOrFetch(env.CACHE, "test:miss", fetchFn);

    expect(result).toEqual({ value: "fresh-data" });
    expect(callCount).toBe(1);

    const cached = await env.CACHE.get("test:miss", "text");
    expect(cached).toBe(JSON.stringify({ value: "fresh-data" }));
  });

  it("should return cached value on hit without calling fetchFn", async () => {
    await env.CACHE.put("test:hit", JSON.stringify({ value: "cached" }));

    let callCount = 0;
    const fetchFn = async () => {
      callCount++;
      return { value: "should-not-be-called" };
    };

    const result = await getCachedOrFetch(env.CACHE, "test:hit", fetchFn);

    expect(result).toEqual({ value: "cached" });
    expect(callCount).toBe(0);
  });

  it("should invalidate a specific cache key", async () => {
    await env.CACHE.put("test:delete", "data");

    await invalidateCache(env.CACHE, "test:delete");

    const result = await env.CACHE.get("test:delete");
    expect(result).toBeNull();
  });

  it("should invalidate all artwork cache keys", async () => {
    await env.CACHE.put("artworks:all", "data-all");
    await env.CACHE.put("artworks:techniques", "data-tech");
    await env.CACHE.put("artwork:art-1", "data-art");

    await invalidateArtworkCache(env.CACHE, "art-1");

    expect(await env.CACHE.get("artworks:all")).toBeNull();
    expect(await env.CACHE.get("artworks:techniques")).toBeNull();
    expect(await env.CACHE.get("artwork:art-1")).toBeNull();
  });

  it("should invalidate global artwork keys without specific artworkId", async () => {
    await env.CACHE.put("artworks:all", "data");
    await env.CACHE.put("artworks:techniques", "data");

    await invalidateArtworkCache(env.CACHE);

    expect(await env.CACHE.get("artworks:all")).toBeNull();
    expect(await env.CACHE.get("artworks:techniques")).toBeNull();
  });
});
