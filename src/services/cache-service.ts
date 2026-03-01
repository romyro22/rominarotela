const DEFAULT_TTL = 3600;

/** Returns cached value or fetches, caches, and returns fresh data. */
export async function getCachedOrFetch<T>(
  cache: KVNamespace,
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds = DEFAULT_TTL,
): Promise<T> {
  const cached = await cache.get(key, "text");
  if (cached !== null) {
    try {
      return JSON.parse(cached) as T;
    } catch {
      console.log(
        JSON.stringify({
          event: "cache.parse.failed",
          key,
          fixSuggestion: "Corrupted KV value — treating as cache miss",
        }),
      );
      await cache.delete(key);
    }
  }

  const fresh = await fetchFn();
  await cache.put(key, JSON.stringify(fresh), { expirationTtl: ttlSeconds });
  return fresh;
}

/** Invalidates a specific cache key. */
export async function invalidateCache(cache: KVNamespace, key: string): Promise<void> {
  await cache.delete(key);
}

/** Invalidates all artwork-related cache keys, including per-technique filter caches. */
export async function invalidateArtworkCache(
  cache: KVNamespace,
  artworkId?: string,
): Promise<void> {
  await cache.delete("artworks:all");
  await cache.delete("artworks:techniques");
  if (artworkId) {
    await cache.delete(`artwork:${artworkId}`);
  }

  // Invalidate per-technique filter caches (prefixed with artworks:technique:)
  const techniqueKeys = await cache.list({ prefix: "artworks:technique:" });
  await Promise.all(techniqueKeys.keys.map((k) => cache.delete(k.name)));
}
