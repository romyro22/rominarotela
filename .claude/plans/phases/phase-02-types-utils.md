# Fase 02: Types y Utils base

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-01-scaffolding.md
**Desbloquea:** Fase 04 (i18n), Fase 05 (Services), Fase 07 (API Routes)

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | `researcher-p02` | **Sí** | Leer galeria.html para extraer la estructura de datos de artworks. Buscar CF Workers types (D1Database, KVNamespace, R2Bucket, Fetcher) en Context7. Verificar pattern `cloudflare:workers` env import. |
| Engineer | `engineer-p02` | **Sí** | Crear env.ts, artwork.ts, api.ts, response.ts, auth.ts, mapper.ts. |
| Tester | — | No | Types y utils se validan con tsc, no con vitest |
| Reviewer | `reviewer-p02` | **Sí** | Verificar type safety, naming conventions, TSDoc en exports. Verificar que ApiSuccess/ApiError coinciden con .claude/sections/07_api_contracts.md. |

## Objetivo

Definir los tipos compartidos y utilidades base que usan todas las capas. Estos archivos son la "columna vertebral" del type system del proyecto.

## Contexto

**Leer antes de implementar:**
- `.claude/sections/04_code_style.md` — convenciones de naming (camelCase vars, PascalCase types)
- `.claude/sections/07_api_contracts.md` — response shapes (ApiSuccess/ApiError)
- `galeria.html` — estructura de datos de artworks (lines 460-581)

## Tareas

### 2.1 Tipo Env (bindings del Worker)

- [ ] CREATE `src/types/env.ts`:

```typescript
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
```

### 2.2 Tipos de dominio (Artwork)

- [ ] CREATE `src/types/artwork.ts`:

Incluir:
- `ArtworkRow` — interfaz con snake_case que refleja las columnas de D1
- `Artwork` — interfaz con camelCase para uso en la app
- `CreateArtworkInput` — DTO para crear artwork
- `UpdateArtworkInput` — DTO parcial para actualizar

**Campos:** id, name_es/en, description_es/en, long_description_es/en, inspiration_es/en, size, technique_es/en, materials_es/en, image_key, tags (JSON string en D1, string[] en TS), sort_order, created_at, updated_at.

> Ver galeria.html lines 460-581 para la estructura de datos original.

### 2.3 Contratos API

- [ ] CREATE `src/types/api.ts`:

```typescript
/** Successful API response. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

/** Error API response. */
export interface ApiError {
  success: false;
  error: { code: string; message: string };
}

/** Union API response type. */
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
```

### 2.4 Helpers de respuesta

- [ ] CREATE `src/utils/response.ts`:

```typescript
import type { ApiSuccess, ApiError } from "../types/api";

/** Build a success JSON response. */
export function jsonSuccess<T>(data: T, status: number = 200): Response {
  const body: ApiSuccess<T> = { success: true, data };
  return Response.json(body, { status });
}

/** Build an error JSON response. */
export function jsonError(code: string, message: string, status: number = 400): Response {
  const body: ApiError = { success: false, error: { code, message } };
  return Response.json(body, { status });
}
```

### 2.5 Autenticación

- [ ] CREATE `src/utils/auth.ts`:

```typescript
import { env } from "cloudflare:workers";

/** Validates Bearer token against the API_KEY secret. Returns true if authorized. */
export function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;
  return authHeader.slice(7) === env.API_KEY;
}
```

### 2.6 Mapper D1 ↔ TypeScript

- [ ] CREATE `src/utils/mapper.ts`:

Función `rowToArtwork(row: ArtworkRow): Artwork` que convierte snake_case D1 rows a camelCase TypeScript objects. Parsea `tags` de JSON string a `string[]`.

## Validación de Fase

```bash
npx tsc --noEmit       # Tipos compilan sin errores
npx biome check src/   # Lint/format pasa
```

## Siguiente fase

→ @.claude/plans/phases/phase-03-d1-schema.md (puede ejecutarse en paralelo)
→ @.claude/plans/phases/phase-04-i18n.md
