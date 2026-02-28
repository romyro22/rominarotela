/** Uploads an image to R2 and returns the key. */
export async function uploadImage(
  storage: R2Bucket,
  key: string,
  body: ReadableStream | ArrayBuffer | string,
  contentType: string,
): Promise<string> {
  try {
    await storage.put(key, body, { httpMetadata: { contentType } });
    return key;
  } catch (error) {
    console.log(
      JSON.stringify({
        event: "image.upload.failed",
        key,
        contentType,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        fixSuggestion: "Check R2 binding and bucket permissions",
      }),
    );
    throw error;
  }
}

/** Gets an image from R2. Returns null if not found. */
export async function getImage(storage: R2Bucket, key: string): Promise<R2ObjectBody | null> {
  try {
    return await storage.get(key);
  } catch (error) {
    console.log(
      JSON.stringify({
        event: "image.get.failed",
        key,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        fixSuggestion: "Check R2 binding and bucket access",
      }),
    );
    throw error;
  }
}

/** Deletes an image from R2. */
export async function deleteImage(storage: R2Bucket, key: string): Promise<void> {
  try {
    await storage.delete(key);
  } catch (error) {
    console.log(
      JSON.stringify({
        event: "image.delete.failed",
        key,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        fixSuggestion: "Check R2 binding and bucket permissions",
      }),
    );
    throw error;
  }
}

/** Lists all image keys for a given artwork. */
export async function listArtworkImages(storage: R2Bucket, artworkId: string): Promise<string[]> {
  try {
    const listed = await storage.list({ prefix: `artworks/${artworkId}/` });
    return listed.objects.map((obj) => obj.key);
  } catch (error) {
    console.log(
      JSON.stringify({
        event: "image.list.failed",
        artworkId,
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        fixSuggestion: "Check R2 binding and bucket access",
      }),
    );
    throw error;
  }
}
