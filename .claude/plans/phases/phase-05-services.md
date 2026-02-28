# Fase 05: Services — Lógica de negocio

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-02-types-utils.md, @.claude/plans/phases/phase-03-d1-schema.md
**Desbloquea:** Fase 07 (API Routes), Fase 09 (Gallery Page)

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | `researcher-p05` | **Sí** | Buscar patterns de D1 prepared statements, R2 put/get/list, KV get/put/delete en Context7 (Cloudflare Workers docs). Verificar API de `cloudflare:workers` env module. Leer types creados en Fase 02. |
| Engineer | `engineer-p05` | **Sí** | Crear artwork-service.ts (7 funciones CRUD), image-service.ts (4 funciones R2), cache-service.ts (3 funciones KV). |
| Tester | — | No | Tests se escriben en Fase 11 |
| Reviewer | `reviewer-p05` | **Sí** | Verificar: parameterized queries (no interpolación), structured JSON logging en errors, mapper usage, type safety. Verificar que service functions siguen patterns de .claude/sections/09_common_patterns.md. |

## Objetivo

Capa de servicios que encapsula toda la lógica de D1, R2 y KV. Los API routes y las Astro pages solo llaman servicios — nunca acceden a bindings directamente.

## Contexto

**Leer antes de implementar:**
- `src/types/artwork.ts` — tipos creados en Fase 02
- `src/utils/mapper.ts` — función `rowToArtwork` creada en Fase 02
- `.claude/sections/09_common_patterns.md` — pattern "D1 Query (Parameterized with Typed Results)"
- `.claude/sections/05_logging.md` — structured JSON logging para error cases

**Principio clave:** Los services acceden a bindings via `import { env } from "cloudflare:workers"`. Esto funciona porque Astro 6 + CF adapter provee el módulo. Si se usa Astro 5, cambiar a recibir `env` como parámetro.

## Tareas

### 5.1 Artwork Service (D1 CRUD)

- [ ] CREATE `src/services/artwork-service.ts`:

**Funciones a implementar:**

| Función | Query D1 | Retorno |
|---------|---------|---------|
| `getAllArtworks()` | `SELECT * FROM artworks ORDER BY sort_order ASC` | `Artwork[]` |
| `getArtworkById(id)` | `SELECT * WHERE id = ?` | `Artwork \| null` |
| `getArtworksByTechnique(technique)` | `SELECT * WHERE technique_es = ?` | `Artwork[]` |
| `createArtwork(input)` | `INSERT INTO artworks ...` | `Artwork` |
| `updateArtwork(id, input)` | `UPDATE artworks SET ... WHERE id = ?` | `Artwork \| null` |
| `deleteArtwork(id)` | `DELETE FROM artworks WHERE id = ?` | `boolean` |
| `getDistinctTechniques()` | `SELECT DISTINCT technique_es` | `string[]` |

**Notas de implementación:**
- Todas las queries usan `.bind()` para parameterización (nunca interpolación de strings)
- `createArtwork` y `updateArtwork` usan `rowToArtwork()` para convertir el resultado
- `updateArtwork` construye el SET clause dinámicamente solo con campos provistos
- `deleteArtwork` retorna `result.meta.changes > 0`
- Log errors con structured JSON: `console.log(JSON.stringify({ event: "error.d1...", ... }))`

### 5.2 Image Service (R2)

- [ ] CREATE `src/services/image-service.ts`:

**Funciones a implementar:**

| Función | Operación R2 | Retorno |
|---------|-------------|---------|
| `uploadImage(key, body, contentType)` | `STORAGE.put(key, body, { httpMetadata })` | `string` (key) |
| `getImage(key)` | `STORAGE.get(key)` | `R2ObjectBody \| null` |
| `deleteImage(key)` | `STORAGE.delete(key)` | `void` |
| `listArtworkImages(artworkId)` | `STORAGE.list({ prefix })` | `string[]` |

**Convención de keys:** `artworks/{artworkId}/{filename}`

### 5.3 Cache Service (KV)

- [ ] CREATE `src/services/cache-service.ts`:

**Funciones a implementar:**

| Función | Operación KV | Retorno |
|---------|-------------|---------|
| `getCachedOrFetch<T>(key, fetchFn, ttl?)` | `CACHE.get` → miss → `fetchFn()` → `CACHE.put` | `T` |
| `invalidateCache(key)` | `CACHE.delete(key)` | `void` |
| `invalidateArtworkCache(artworkId?)` | Delete `artworks:all`, `artworks:techniques`, `artwork:{id}` | `void` |

**Cache keys:**
- `artworks:all` — lista completa de artworks
- `artwork:{id}` — artwork individual
- `artworks:techniques` — lista de técnicas para el filtro
- TTL default: 3600 segundos (1 hora)

## Validación de Fase

```bash
npx tsc --noEmit       # Tipos compilan sin errores
npx biome check src/   # Lint/format pasa
```

> Los services se testean a fondo en Fase 11. En esta fase solo verificamos que compilan.

## Siguiente fase

→ @.claude/plans/phases/phase-07-api-routes.md
