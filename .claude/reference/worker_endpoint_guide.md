# Worker Endpoint Guide

How to add a new route/endpoint to the rominarotela Workers project.

## Step 1: Define Types in `src/types/`

```typescript
// src/types/artwork.ts
export interface Artwork {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  technique: string;
  techniqueEn: string;
  size: string;
  imageKey: string;
  tags: string[];
}

export interface ArtworkListParams {
  technique?: string;
  search?: string;
  lang?: "es" | "en";
  limit?: number;
  offset?: number;
}
```

## Step 2: Create Route Handler in `src/routes/`

```typescript
// src/routes/artworks.ts
import type { Env } from "../types/env";
import { listArtworks } from "../services/artwork-service";

export async function handleListArtworks(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const params = {
    technique: url.searchParams.get("technique") ?? undefined,
    search: url.searchParams.get("q") ?? undefined,
    limit: Math.min(Number(url.searchParams.get("limit")) || 50, 100),
  };

  try {
    const result = await listArtworks(env.DB, params);
    return Response.json({ success: true, data: result });
  } catch {
    return Response.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch artworks" } },
      { status: 500 }
    );
  }
}
```

## Step 3: Add Business Logic in `src/services/`

```typescript
// src/services/artwork-service.ts
import type { Artwork, ArtworkListParams } from "../types/artwork";

export async function listArtworks(db: D1Database, params: ArtworkListParams) {
  let query = "SELECT * FROM artworks WHERE 1=1";
  const bindings: unknown[] = [];

  if (params.technique) {
    query += " AND technique = ?";
    bindings.push(params.technique);
  }
  if (params.search) {
    query += " AND (title LIKE ? OR description LIKE ?)";
    const term = `%${params.search}%`;
    bindings.push(term, term);
  }

  query += " ORDER BY created_at DESC LIMIT ?";
  bindings.push(params.limit ?? 50);

  const result = await db.prepare(query).bind(...bindings).all<Artwork>();
  return result.results;
}
```

## Step 4: Register Route in `src/index.ts`

```typescript
// src/index.ts
import type { Env } from "./types/env";
import { handleListArtworks } from "./routes/artworks";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/api/artworks" && request.method === "GET") {
      return handleListArtworks(request, env);
    }
    return env.ASSETS.fetch(request);
  },
};
```

## Step 5: Write Tests in `tests/routes/`

```typescript
// tests/routes/artworks.test.ts
import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import worker from "../../src/index";

describe("GET /api/artworks", () => {
  it("should return artworks with success envelope", async () => {
    await env.DB.exec(
      "INSERT INTO artworks (id, title, technique) VALUES ('a1', 'Perla Inu', 'oleo')"
    );
    const response = await worker.fetch(new Request("http://localhost/api/artworks"), env);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });
});
```

## Step 6: Run Validation

```bash
npx biome check src/ && npx tsc --noEmit && npx vitest --run
```

## Checklist

- [ ] Types in `src/types/` (request params + response shape)
- [ ] Route handler in `src/routes/` (parse request, call service, return Response)
- [ ] Business logic in `src/services/` (D1 queries, data transforms)
- [ ] Route registered in `src/index.ts` (URL pattern + HTTP method)
- [ ] Tests in `tests/routes/` (mock env, assert status + body)
- [ ] All D1 queries use parameterized `.bind()` (no string interpolation)
- [ ] Response follows `{ success, data }` / `{ success, error }` envelope
- [ ] Validation passes: biome + tsc + vitest
