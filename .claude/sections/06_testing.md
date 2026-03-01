# Testing

## Framework

Vitest + `@cloudflare/vitest-pool-workers` for Workers-compatible test execution.

## Configuration

Use `vitest.config.ts` with `defineWorkersConfig` from `@cloudflare/vitest-pool-workers/config`.

## Coverage

Provider: `@vitest/coverage-istanbul` (v8 provider is incompatible with Workers pool — `node:inspector` not available in workerd). Thresholds enforced in `vitest.config.ts`:

- Statements: ≥ 75%
- Branches: ≥ 60% (lower due to untestable catch blocks in Workers runtime)
- Functions: ≥ 80%
- Lines: ≥ 75%

```bash
npx vitest --coverage
```

## Structure

Tests mirror source layout:

- `src/services/artwork-service.ts` → `tests/services/artwork-service.test.ts`
- `src/pages/api/artworks/index.ts` → `tests/api/artworks.test.ts`
- `src/utils/auth.ts` → `tests/utils/auth.test.ts`

## Conventions

- `describe("ArtworkService")` groups, `it("should filter artworks by technique")` cases
- Use `describe.concurrent` for independent parallel tests
- Skip with `it.skip`, focus with `it.only` (never commit `.only`)
- Minimum 80% coverage: `npx vitest --coverage`
- Verify every assertion tests real domain logic, not implementation details

## Example: Service Unit Test

```typescript
import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { filterArtworksByTechnique } from "../../src/services/artwork-service";

describe("ArtworkService", () => {
  it("should return only artworks matching the given technique", async () => {
    await env.DB.exec(
      "INSERT INTO artworks (id, title, technique) VALUES ('a1', 'Paisaje', 'acuarela')"
    );

    const results = await filterArtworksByTechnique(env.DB, "acuarela");

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Paisaje");
  });
});
```

## Example: API Handler Unit Test

Use `createMockContext()` from `tests/helpers/mock-context.ts` to create a mock Astro `APIContext` with real D1/KV/R2 bindings from `cloudflare:test`.

```typescript
import { describe, it, expect } from "vitest";
import { GET } from "../../src/pages/api/artworks/index";
import type { ApiSuccess } from "../../src/types/api";
import type { Artwork } from "../../src/types/artwork";
import { createMockContext, createAuthenticatedContext } from "../helpers/mock-context";

describe("GET /api/artworks", () => {
  it("should return artworks list", async () => {
    const ctx = createMockContext({ url: "https://example.com/api/artworks" });
    const response = await GET(ctx);
    const body = (await response.json()) as ApiSuccess<Artwork[]>;

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });
});
```

## Known Limitations

- **R2 isolated storage**: `vitest-pool-workers` cannot handle multiple R2 reads in a single test. Place R2 setup in `beforeEach` and consume response bodies with `await response.arrayBuffer()` to release R2 object references.
