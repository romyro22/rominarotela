# Fase 03: D1 — Schema y migraciones

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-01-scaffolding.md
**Desbloquea:** Fase 05 (Services), Fase 09 (Gallery Page)

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | `researcher-p03` | **Sí** | Leer galeria.html lines 460-581 para extraer datos exactos de las 7 obras (nombres, descripciones ES/EN, técnicas, tamaños, tags). Verificar D1 SQL syntax en Context7/CF docs. |
| Engineer | `engineer-p03` | **Sí** | Crear 0001_create_artworks.sql y 0002_seed_artworks.sql. Ejecutar migrations --local. |
| Tester | — | No | Validación via SQL queries directas |
| Reviewer | `reviewer-p03` | **Sí** | Revisar schema (indexes, defaults, NOT NULL). Verificar que seed data coincide exactamente con galeria.html. Verificar SQL injection safety (parameterized queries). |

## Objetivo

Base de datos D1 con tabla `artworks` y datos iniciales de las 7 obras existentes en galeria.html.

## Contexto

**Leer antes de implementar:**
- `galeria.html` lines 460-581 — datos de las 7 obras con todos los campos ES/EN
- `.claude/plans/cloudflare-stack-resume.md` — sección D1 commands
- `.claude/sections/08_dev_commands.md` — comandos de migración D1

Los datos se extraen textualmente de galeria.html. Los `image_key` apuntan a paths R2 que se crearán en Fase 10.

## Tareas

### 3.1 Crear tabla artworks

- [ ] CREATE `migrations/0001_create_artworks.sql`:

```sql
-- Create artworks table for the gallery
CREATE TABLE IF NOT EXISTS artworks (
  id TEXT PRIMARY KEY,
  name_es TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description_es TEXT NOT NULL,
  description_en TEXT NOT NULL,
  long_description_es TEXT NOT NULL DEFAULT '',
  long_description_en TEXT NOT NULL DEFAULT '',
  inspiration_es TEXT NOT NULL DEFAULT '',
  inspiration_en TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL,
  technique_es TEXT NOT NULL,
  technique_en TEXT NOT NULL,
  materials_es TEXT NOT NULL DEFAULT '',
  materials_en TEXT NOT NULL DEFAULT '',
  image_key TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for filtering by technique
CREATE INDEX IF NOT EXISTS idx_artworks_technique ON artworks(technique_es);

-- Index for sorting
CREATE INDEX IF NOT EXISTS idx_artworks_sort_order ON artworks(sort_order);
```

### 3.2 Seed de datos iniciales

- [ ] CREATE `migrations/0002_seed_artworks.sql`:

Insertar las 7 obras de galeria.html. Cada INSERT incluye:
- `id`: slug del nombre (e.g., `perla_inu`)
- `name_es` / `name_en`: nombres bilingües
- `description_es` / `description_en`: descripciones
- `size`, `technique_es/en`: metadatos
- `image_key`: path R2 en formato `artworks/{id}/{filename}.png`
- `tags`: JSON array string (e.g., `'["óleo", "contemporáneo"]'`)
- `sort_order`: 1-7

**Obras a insertar:**
1. `perla_inu` — Perla Inu (Óleo, 40×30 cm)
2. `el_retrato_de_una_culpa_silenciosa` — El retrato de una culpa silenciosa (Óleo, 30×30 cm)
3. `la_tristeza_del_guason` — La tristeza del Guasón (Gouache, 20×20 cm)
4. `la_nina_y_el_gato_negro` — La niña y el gato negro (Ilustración digital, 500×400 px)
5. `pedro_pedro_pedro` — Pedro, Pedro, Pedro (Ilustración digital, 500×300 px)
6. `las_aventuras_de_capi_y_pajarito` — Las aventuras de Capi y Pajarito (Pixelart, 500×400 px)
7. `madre_e_hijo` — Madre e hijo (Dibujo tradicional, 21×35 cm)

> **Importante:** Escapar comillas simples en los textos SQL con `''`.

### 3.3 Aplicar migraciones localmente

- [ ] EXECUTE: `wrangler d1 migrations apply portfolio-db --local`

## Validación de Fase

```bash
wrangler d1 migrations apply portfolio-db --local
wrangler d1 execute portfolio-db --local --command "SELECT COUNT(*) FROM artworks"
# Debe devolver: 7
wrangler d1 execute portfolio-db --local --command "SELECT id, name_es FROM artworks ORDER BY sort_order"
# Debe devolver las 7 obras en orden
```

## Siguiente fase

→ @.claude/plans/phases/phase-05-services.md
