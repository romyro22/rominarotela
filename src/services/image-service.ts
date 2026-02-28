/** Uploads an image to R2 and returns the key. */
export async function uploadImage(
  storage: R2Bucket,
  key: string,
  body: ReadableStream | ArrayBuffer | string,
  contentType: string,
): Promise<string> {
  await storage.put(key, body, { httpMetadata: { contentType } });
  return key;
}

/** Gets an image from R2. Returns null if not found. */
export async function getImage(storage: R2Bucket, key: string): Promise<R2ObjectBody | null> {
  return storage.get(key);
}

/** Deletes an image from R2. */
export async function deleteImage(storage: R2Bucket, key: string): Promise<void> {
  await storage.delete(key);
}

/** Lists all image keys for a given artwork. */
export async function listArtworkImages(storage: R2Bucket, artworkId: string): Promise<string[]> {
  const listed = await storage.list({ prefix: `artworks/${artworkId}/` });
  return listed.objects.map((obj) => obj.key);
}
