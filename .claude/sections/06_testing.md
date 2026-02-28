# Testing

## Framework

Vitest + `@cloudflare/vitest-pool-workers` for Workers-compatible test execution.

## Configuration

Use `vitest.config.ts` with `defineWorkersConfig` from `@cloudflare/vitest-pool-workers/config`.

## Structure

Tests mirror source: `src/routes/artworks.ts` -> `tests/routes/artworks.test.ts`.

## Conventions

- `describe("ArtworkService")` groups, `it("should filter artworks by technique")` cases
- Use `describe.concurrent` for independent parallel tests
- Skip with `it.skip`, focus with `it.only` (never commit `.only`)
- Minimum 80% coverage: `npx vitest --coverage`
- Verify every assertion tests real domain logic, not implementation details

## Example

```typescript
import { describe, it, expect } from "vitest";
import { env } from "cloudflare:test";
import { filterArtworksByTechnique } from "../../src/services/artwork-service";

describe("ArtworkService", () => {
  it("should return only artworks matching the given technique", async () => {
    await env.DB.exec(
      "INSERT INTO artworks (id, title, technique) VALUES ('a1', 'Paisaje', 'acuarela')"
    );
    await env.DB.exec(
      "INSERT INTO artworks (id, title, technique) VALUES ('a2', 'Retrato', 'oleo')"
    );

    const results = await filterArtworksByTechnique(env.DB, "acuarela");

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Paisaje");
    expect(results[0].technique).toBe("acuarela");
  });
});
```
