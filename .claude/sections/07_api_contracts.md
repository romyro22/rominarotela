# API Contracts

## Response Shapes

```typescript
// Success
interface ApiSuccess<T> {
  success: true;
  data: T;
}

// Error
interface ApiError {
  success: false;
  error: { code: string; message: string };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

## Rules

- Worker routes return typed `Response` objects with `Content-Type: application/json`
- Validate request input at the route handler entry point (Zod or manual type guards)
- Types defined in `src/types/` and shared between routes and tests
- D1 accessed via `env.DB` — always use parameterized `.bind()` queries

## Example

```typescript
import type { Env } from "../types/env";
import type { Artwork } from "../types/artwork";

export async function handleGetArtwork(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const artworkId = url.searchParams.get("id");

  if (!artworkId) {
    return Response.json(
      { success: false, error: { code: "MISSING_ID", message: "Artwork ID is required" } },
      { status: 400 }
    );
  }

  const artwork = await env.DB
    .prepare("SELECT * FROM artworks WHERE id = ?")
    .bind(artworkId)
    .first<Artwork>();

  if (!artwork) {
    return Response.json(
      { success: false, error: { code: "NOT_FOUND", message: "Artwork not found" } },
      { status: 404 }
    );
  }

  return Response.json({ success: true, data: artwork });
}
```
