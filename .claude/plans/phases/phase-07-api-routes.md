# Fase 07: API Routes — CRUD de artworks + imágenes

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-05-services.md
**Desbloquea:** Fase 10 (R2 Migration), Fase 11 (Testing)

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | `researcher-p07` | **Sí** | Buscar Astro server endpoints pattern (APIRoute type, GET/POST/PUT/DELETE exports, params, request) en Context7. Verificar multipart FormData handling en Workers. Leer services creados en Fase 05. |
| Engineer | `engineer-p07` | **Sí** | Crear artworks/index.ts, artworks/[id].ts, images/upload.ts, images/[...key].ts. Conectar con services, auth, response utils. |
| Tester | — | No | Tests se escriben en Fase 11 |
| Reviewer | `reviewer-p07` | **Sí** | Verificar: auth en todos los write endpoints, input validation, error codes consistentes, cache invalidation en mutations, response contract compliance. Test manual con curl. |

## Objetivo

Endpoints REST completos para artworks y gestión de imágenes R2. Todos los endpoints siguen el contrato `ApiSuccess<T> | ApiError` definido en Fase 02.

## Contexto

**Leer antes de implementar:**
- `src/services/artwork-service.ts` — funciones de negocio (Fase 05)
- `src/services/image-service.ts` — funciones R2 (Fase 05)
- `src/services/cache-service.ts` — funciones KV (Fase 05)
- `src/utils/auth.ts` — `isAuthorized()` (Fase 02)
- `src/utils/response.ts` — `jsonSuccess()`, `jsonError()` (Fase 02)
- `.claude/sections/07_api_contracts.md` — response shapes

**Patrón Astro API route:**
- Archivos `.ts` (no `.astro`) en `src/pages/api/`
- Exportan funciones nombradas: `GET`, `POST`, `PUT`, `DELETE`
- Reciben `context` con `{ params, request, url }`
- Retornan `Response`

**Reglas de auth:**
- `GET` → público (sin auth)
- `POST`, `PUT`, `DELETE` → requieren `Authorization: Bearer <API_KEY>`

## Tareas

### 7.1 Artworks — List + Create

- [ ] CREATE `src/pages/api/artworks/index.ts`:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/artworks` | No | Lista todos. Acepta `?technique=` para filtrar. Cacheado en KV. |
| POST | `/api/artworks` | Sí | Crea nuevo artwork. Invalida cache. |

**GET flow:** `getCachedOrFetch("artworks:all", getAllArtworks)` → `jsonSuccess(artworks)`
**POST flow:** `isAuthorized()` → parse body → validate required fields → `createArtwork(input)` → `invalidateArtworkCache()` → `jsonSuccess(artwork, 201)`

### 7.2 Artworks — Get + Update + Delete

- [ ] CREATE `src/pages/api/artworks/[id].ts`:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/artworks/:id` | No | Devuelve un artwork. Cacheado en KV. |
| PUT | `/api/artworks/:id` | Sí | Actualiza campos parciales. Invalida cache. |
| DELETE | `/api/artworks/:id` | Sí | Elimina artwork + imágenes R2 asociadas. Invalida cache. |

**DELETE flow:** `isAuthorized()` → `listArtworkImages(id)` → delete each → `deleteArtwork(id)` → `invalidateArtworkCache(id)` → `jsonSuccess({ deleted: true })`

### 7.3 Images — Upload

- [ ] CREATE `src/pages/api/images/upload.ts`:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/api/images/upload` | Sí | Upload multipart form (file + artworkId) a R2. |

**Flow:** `isAuthorized()` → parse FormData → validate file + artworkId → `uploadImage(key, body, contentType)` → `jsonSuccess({ key, size, contentType }, 201)`

**Key format:** `artworks/{artworkId}/{filename}`

### 7.4 Images — Serve

- [ ] CREATE `src/pages/api/images/[...key].ts`:

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/api/images/*` | No | Sirve imagen desde R2. Cache headers agresivos. |

**Flow:** `getImage(key)` → 404 if null → Response con body, Content-Type, Cache-Control 1 year, ETag.

> Usa `[...key]` (rest params) para capturar paths con `/` como `artworks/perla_inu/pintura.png`.

## Validación de Fase

```bash
npx tsc --noEmit
npx biome check src/
npm run dev
```

Test manual con curl:
```bash
# GET público
curl http://localhost:4321/api/artworks | jq '.success'
# Debe ser: true

# GET con ID
curl http://localhost:4321/api/artworks/perla_inu | jq '.data.nameEs'
# Debe ser: "Perla Inu"

# POST sin auth → 401
curl -X POST http://localhost:4321/api/artworks -d '{}' | jq '.error.code'
# Debe ser: "UNAUTHORIZED"

# POST con auth → 201
curl -X POST http://localhost:4321/api/artworks \
  -H "Authorization: Bearer dev-local-secret-key-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"id":"test","nameEs":"Test","nameEn":"Test","descriptionEs":"D","descriptionEn":"D","size":"10x10","techniqueEs":"T","techniqueEn":"T","imageKey":"test.png"}'
# Debe retornar artwork creado

# DELETE con auth
curl -X DELETE http://localhost:4321/api/artworks/test \
  -H "Authorization: Bearer dev-local-secret-key-change-in-production"
# Debe retornar { deleted: true }
```

## Siguiente fase

→ @.claude/plans/phases/phase-10-r2-migration.md
→ @.claude/plans/phases/phase-11-testing.md
