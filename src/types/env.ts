/** Environment bindings available to the Worker. */
export interface Env {
  /** D1 database for artworks and portfolio data. */
  DB: D1Database;
  /** KV namespace for caching API responses. */
  CACHE: KVNamespace;
  /** R2 bucket for artwork images. */
  STORAGE: R2Bucket;
  /** Workers Static Assets binding. */
  ASSETS: Fetcher;
  /** API key for authenticating write operations. */
  API_KEY: string;
}
