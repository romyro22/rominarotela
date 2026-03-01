# Fase 11: Testing

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-07-api-routes.md, @.claude/plans/phases/phase-09-gallery-page.md
**Desbloquea:** Fase 12 (Validation)

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | `researcher-p11` | **Sí** | Buscar patterns de `@cloudflare/vitest-pool-workers` testing en Context7: `SELF.fetch()`, `env` from `cloudflare:test`, D1 test setup. Leer .claude/sections/06_testing.md. |
| Engineer | — | No | Tester es el implementador en esta fase |
| Tester | `tester-p11` | **Sí** | Escribir tests para artwork-service, cache-service, API artworks, API images. Ejecutar vitest run + coverage. Target ≥80% services, ≥70% API. |
| Reviewer | `reviewer-p11` | **Sí** | Verificar que tests cubren happy path + error cases + auth. Verificar que assertions testean domain logic, no implementación. Verificar que no hay .only() committed. |

## Objetivo

Tests unitarios para services + tests de integración para API routes. Mínimo 80% coverage en services, 70% en API routes.

## Contexto

**Leer antes de implementar:**
- `vitest.config.ts` — configuración con `@cloudflare/vitest-pool-workers` (Fase 01)
- `src/services/*.ts` — funciones a testear (Fase 05)
- `src/pages/api/**/*.ts` — endpoints a testear (Fase 07)
- `.claude/sections/06_testing.md` — convenciones de testing

**Framework:** Vitest con `@cloudflare/vitest-pool-workers`. Los tests corren en el runtime de Workers real (miniflare), con acceso a D1, KV, R2 bindings locales.

**Patrones:**
- `describe("ServiceName")` para grupos
- `it("should do something specific")` para casos
- `SELF.fetch()` para tests de integración de API routes
- `env.DB` para seed/verify datos en tests

## Tareas

### 11.1 Tests de Artwork Service

- [ ] CREATE `tests/services/artwork-service.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";

describe("ArtworkService", () => {
  beforeEach(async () => {
    // Create table and seed test data
    await env.DB.exec(`
      CREATE TABLE IF NOT EXISTS artworks (...);
      DELETE FROM artworks;
      INSERT INTO artworks (...) VALUES (...);
    `);
  });

  // Tests:
  it("should return all artworks ordered by sort_order");
  it("should return a single artwork by ID");
  it("should return null for non-existent ID");
  it("should filter artworks by technique");
  it("should create a new artwork");
  it("should update an existing artwork partially");
  it("should return null when updating non-existent artwork");
  it("should delete an artwork and return true");
  it("should return false when deleting non-existent artwork");
  it("should return distinct techniques");
});
```

### 11.2 Tests de Cache Service

- [ ] CREATE `tests/services/cache-service.test.ts`:

```typescript
describe("CacheService", () => {
  it("should return cached value on hit");
  it("should call fetchFn and cache result on miss");
  it("should invalidate a specific cache key");
  it("should invalidate all artwork cache keys");
});
```

### 11.3 Tests de API Artworks

- [ ] CREATE `tests/api/artworks.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("Artworks API", () => {
  // GET /api/artworks
  it("should return all artworks with success: true");
  it("should filter by technique query param");

  // GET /api/artworks/:id
  it("should return a single artwork");
  it("should return 404 for unknown ID");

  // POST /api/artworks (auth required)
  it("should return 401 without Authorization header");
  it("should return 401 with invalid API key");
  it("should create artwork with valid auth and input");
  it("should return 400 for missing required fields");

  // PUT /api/artworks/:id (auth required)
  it("should update artwork fields");
  it("should return 404 for unknown ID");

  // DELETE /api/artworks/:id (auth required)
  it("should delete artwork and return success");
  it("should return 404 for unknown ID");
});
```

### 11.4 Tests de API Images

- [ ] CREATE `tests/api/images.test.ts`:

```typescript
describe("Images API", () => {
  // POST /api/images/upload
  it("should return 401 without auth");
  it("should upload image to R2 with valid auth");
  it("should return 400 without file or artworkId");

  // GET /api/images/:key
  it("should serve image from R2 with correct content-type");
  it("should return 404 for non-existent key");
  it("should include cache headers");
});
```

### 11.5 Test de seguridad

Verificar en todos los endpoints de escritura:

- [ ] ADD assertions en cada test POST/PUT/DELETE:
  - Sin header → 401
  - Con header incorrecto → 401
  - Con "Bearer wrong-key" → 401
  - Con Bearer correcto → 2xx

## Validación de Fase

```bash
npx vitest run                    # Todos los tests pasan
npx vitest run --coverage         # Coverage report
```

**Coverage targets:**
- `src/services/artwork-service.ts` → ≥ 80%
- `src/services/cache-service.ts` → ≥ 80%
- `src/pages/api/artworks/*.ts` → ≥ 70%
- `src/pages/api/images/*.ts` → ≥ 70%

## Siguiente fase

→ @.claude/plans/phases/phase-12-validation.md
