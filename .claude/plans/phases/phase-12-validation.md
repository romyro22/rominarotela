# Fase 12: Validación completa y cleanup

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** Todas las fases anteriores
**Desbloquea:** Deploy a producción

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | — | No | Todo ya está investigado |
| Engineer | `engineer-p12` | **Sí** | Ejecutar suite de validación completa. Fix cualquier issue pendiente. Cleanup archivos legacy. Actualizar CLAUDE.md. |
| Tester | `tester-p12` | **Sí** | Ejecutar validación funcional manual (checklist completo). Ejecutar curl tests contra API. Verificar visual parity. |
| Reviewer | `reviewer-p12` | **Sí** | Review final: seguridad (.dev.vars gitignored, no hardcoded keys, parameterized queries), code quality, patterns compliance. Sign-off final. |

## Objetivo

Todo funciona end-to-end. Suite de validación completa pasa. Deploy dry-run exitoso. Archivos legacy eliminados.

## Contexto

Esta es la fase final. Todos los componentes deben estar integrados y funcionando juntos. Se verifica tanto la suite automatizada como funcionalidad manual.

## Tareas

### 12.1 Suite de validación automatizada

- [ ] VALIDATE: `npx biome check src/` — sin errores de lint/format
- [ ] VALIDATE: `npx astro check` — sin errores de tipos Astro
- [ ] VALIDATE: `npx tsc --noEmit` — sin errores de TypeScript
- [ ] VALIDATE: `npx vitest run` — todos los tests pasan
- [ ] VALIDATE: `npm run build` — build de Astro completa sin errores
- [ ] VALIDATE: `npx wrangler deploy --dry-run` — deploy simulado exitoso

### 12.2 Verificación funcional (manual)

Iniciar dev server: `npm run dev`

**Portfolio (`/`):**
- [ ] Page carga sin errores de consola
- [ ] Header: logo, tagline, language switcher, contact link
- [ ] Hero: portrait, nombre, rol, subtítulo, CTAs
- [ ] Development: 4 secciones colapsables abren/cierran
- [ ] Experience: 4 entradas de trabajo visibles
- [ ] Skills: 7 badges visibles
- [ ] Work Projects: 6 cards con imágenes, links funcionan
- [ ] Personal Projects: 4 tabs switchean correctamente
- [ ] Footer: WhatsApp, CV download, GitHub links
- [ ] Comparación visual: idéntico a index.html original

**Portfolio EN (`/en/`):**
- [ ] Todos los textos en inglés
- [ ] CV button descarga versión EN
- [ ] Language switcher marca "EN" como activo

**Gallery (`/galeria`):**
- [ ] 7 artwork cards con imágenes de R2
- [ ] Búsqueda filtra en tiempo real
- [ ] Select de técnicas filtra correctamente
- [ ] Click en card abre modal
- [ ] Modal: imagen, título, técnica, tamaño, descripción
- [ ] "Copiar ficha" copia al clipboard
- [ ] ESC cierra modal

**Gallery EN (`/en/galeria`):**
- [ ] Textos en inglés, nombres/descripciones de obras en inglés

**API:**
```bash
# GET artworks (público)
curl http://localhost:4321/api/artworks | jq '.success, (.data | length)'
# true, 7

# GET artwork por ID
curl http://localhost:4321/api/artworks/perla_inu | jq '.data.nameEs'
# "Perla Inu"

# GET con filtro de técnica
curl "http://localhost:4321/api/artworks?technique=Gouache" | jq '.data | length'
# 1

# POST sin auth → 401
curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:4321/api/artworks
# 401

# POST con auth → 201
curl -X POST http://localhost:4321/api/artworks \
  -H "Authorization: Bearer dev-local-secret-key-change-in-production" \
  -H "Content-Type: application/json" \
  -d '{"id":"test_validation","nameEs":"Test","nameEn":"Test","descriptionEs":"D","descriptionEn":"D","size":"10x10","techniqueEs":"T","techniqueEn":"T","imageKey":"test.png"}' \
  | jq '.success'
# true

# DELETE cleanup
curl -X DELETE http://localhost:4321/api/artworks/test_validation \
  -H "Authorization: Bearer dev-local-secret-key-change-in-production" \
  | jq '.data.deleted'
# true

# GET imagen de R2
curl -s -o /dev/null -w "%{http_code}" http://localhost:4321/api/images/artworks/perla_inu/pintura.png
# 200
```

### 12.3 Cleanup de archivos legacy

- [ ] VERIFY que `index.html` ya no está en root (eliminado en Fase 08)
- [ ] VERIFY que `galeria.html` ya no está en root (eliminado en Fase 09)
- [ ] VERIFY que `img/galeria/` ya no está en root (eliminado en Fase 10)
- [ ] VERIFY que `img/` del root solo contiene imágenes que migraron a `public/img/`
- [ ] REMOVE `img/` del root si ya está vacío o sus contenidos están en `public/img/`
- [ ] REMOVE `docs/` del root si ya está vacío o sus contenidos están en `public/docs/`

### 12.4 Actualizar documentación

- [ ] UPDATE `CLAUDE.md` — sección "Current State":
  ```markdown
  ## Current State
  Astro 6 + Cloudflare Workers. Portfolio SSR + Gallery with D1/R2/KV backend.
  API CRUD for artworks with API key auth. i18n ES/EN via Astro routing.
  ```

- [ ] VERIFY `.gitignore` incluye: `node_modules/`, `dist/`, `.wrangler/`, `.dev.vars`, `.astro/`, `*.log`

### 12.5 Verificación de seguridad

- [ ] VERIFY: `.dev.vars` está en `.gitignore` (nunca commitear secretos)
- [ ] VERIFY: No hay API keys hardcodeados en el código fuente
- [ ] VERIFY: Todas las queries D1 usan `.bind()` (no interpolación)
- [ ] VERIFY: POST/PUT/DELETE endpoints requieren auth

## Resultado Esperado

Al completar esta fase:

```bash
$ npm run validate
# biome check ✓
# astro check ✓
# tsc --noEmit ✓
# vitest run ✓ (all tests passing)

$ npm run build
# Build successful

$ npx wrangler deploy --dry-run
# Dry run successful
```

El proyecto está listo para:
1. `wrangler d1 create portfolio-db` → obtener database_id real
2. `wrangler kv namespace create CACHE` → obtener KV id real
3. `wrangler r2 bucket create rominarotela-images` → crear bucket
4. `wrangler secret put API_KEY` → configurar secreto de producción
5. Actualizar `wrangler.jsonc` con IDs reales
6. `wrangler d1 migrations apply portfolio-db --remote` → aplicar schema
7. Migrar imágenes a R2 remoto
8. `npm run deploy` → live!

## Fase final — Migración completada
