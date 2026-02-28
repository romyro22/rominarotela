# Fase 01: Scaffolding — npm, TypeScript, Astro, Biome, Wrangler, Vitest

**Plan padre:** @.claude/plans/cloudflare-full-migration.md
**Estado:** pendiente
**Depende de:** @.claude/plans/phases/phase-00-cloud-resources.md
**Desbloquea:** Todas las fases siguientes

## Agentes

| Rol | Agente | Activo | Tarea principal |
|-----|--------|--------|-----------------|
| Researcher | `researcher-p01` | **Sí** | Verificar versiones actuales de Astro, @astrojs/cloudflare, Biome, Vitest. Buscar breaking changes. Confirmar config patterns en Context7. |
| Engineer | `engineer-p01` | **Sí** | Crear package.json, tsconfig, biome.json, astro.config, wrangler.jsonc, vitest.config. npm install. |
| Tester | — | No | No hay código runtime que testear aún |
| Reviewer | `reviewer-p01` | **Sí** | Verificar que configs siguen convenciones de CLAUDE.md. Verificar compatibilidad entre versiones. |

## Objetivo

Proyecto inicializado con todas las herramientas configuradas y un Worker mínimo que arranca. Al completar esta fase, `npm run dev` debe arrancar sin errores.

## Contexto

La Fase 00 ya creó los recursos cloud (D1, KV, R2) y obtuvo los IDs reales. Esta fase usa esos IDs en `wrangler.jsonc` — no hay placeholders.

**Leer antes de implementar:**
- `.claude/plans/phases/phase-00-cloud-resources.md` — IDs obtenidos
- `.claude/sections/02_tech_stack.md` — versiones exactas
- `.claude/sections/03_architecture.md` — estructura target
- `.claude/plans/cloudflare-stack-resume.md` — referencia del stack CF

## Tareas

### 1.1 Inicializar npm y dependencias

- [ ] CREATE `package.json` — ejecutar `npm init -y`, ajustar name/description
- [ ] ADD dependencia `astro` — framework fullstack
- [ ] ADD dependencia `@astrojs/cloudflare` — adapter CF Workers
- [ ] ADD dependencia `wrangler` (devDep) — CLI de Cloudflare
- [ ] ADD dependencia `typescript` (devDep) — compilador
- [ ] ADD dependencia `@biomejs/biome` (devDep) — linter/formatter
- [ ] ADD dependencia `vitest` (devDep) — test runner
- [ ] ADD dependencia `@cloudflare/vitest-pool-workers` (devDep) — Workers test pool
- [ ] ADD dependencia `@cloudflare/workers-types` (devDep) — tipos del runtime
- [ ] UPDATE `package.json` — agregar scripts:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "deploy": "astro build && wrangler deploy",
    "check": "biome check src/",
    "check:fix": "biome check --write src/",
    "test": "vitest run",
    "typecheck": "astro check && tsc --noEmit",
    "validate": "biome check src/ && astro check && tsc --noEmit && vitest run"
  }
}
```

- [ ] VALIDATE: `npm install` completa sin errores

### 1.2 Configuración de TypeScript

- [ ] CREATE `tsconfig.json`:

```jsonc
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["@cloudflare/workers-types/2023-07-01", "@cloudflare/vitest-pool-workers"],
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts", "src/**/*.astro", "tests/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 1.3 Configuración de Biome

- [ ] CREATE `biome.json`:

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "organizeImports": { "enabled": true },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "files": {
    "ignore": ["node_modules", "dist", ".wrangler", ".astro"]
  }
}
```

### 1.4 Configuración de Astro

- [ ] CREATE `astro.config.ts`:

```typescript
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
      persist: true,
    },
  }),
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

### 1.5 Configuración de Wrangler

- [ ] CREATE `wrangler.jsonc` — **usar los IDs reales obtenidos en Fase 00**:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "rominarotela",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_date": "2026-02-28",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "binding": "ASSETS",
    "directory": "./dist"
  },
  "d1_databases": [{
    "binding": "DB",
    "database_name": "portfolio-db",
    "database_id": "<D1 database_id de Fase 00>"
  }],
  "kv_namespaces": [{
    "binding": "CACHE",
    "id": "<KV id de Fase 00>"
  }],
  "r2_buckets": [{
    "binding": "STORAGE",
    "bucket_name": "rominarotela-images"
  }],
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1
  }
}
```

> **Importante:** Reemplazar `<D1 database_id de Fase 00>` y `<KV id de Fase 00>` con los valores reales anotados en @.claude/plans/phases/phase-00-cloud-resources.md

- [ ] CREATE `.dev.vars`:

```
API_KEY=dev-local-secret-key-change-in-production
```

### 1.6 Configuración de Vitest

- [ ] CREATE `vitest.config.ts`:

```typescript
import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
      },
    },
  },
});
```

### 1.7 Actualizar .gitignore

- [ ] UPDATE `.gitignore`:

```
node_modules/
dist/
.wrangler/
.dev.vars
.astro/
*.log
```

### 1.8 Crear directorios base

- [ ] CREATE directorio `src/pages/`
- [ ] CREATE directorio `src/components/`
- [ ] CREATE directorio `src/layouts/`
- [ ] CREATE directorio `src/services/`
- [ ] CREATE directorio `src/types/`
- [ ] CREATE directorio `src/utils/`
- [ ] CREATE directorio `src/i18n/`
- [ ] CREATE directorio `src/styles/`
- [ ] CREATE directorio `public/`
- [ ] CREATE directorio `migrations/`
- [ ] CREATE directorio `tests/`
- [ ] CREATE directorio `scripts/`

### 1.9 Placeholder page (para que Astro arranque)

- [ ] CREATE `src/pages/index.astro` — placeholder mínimo:

```astro
---
// Placeholder — will be replaced in Phase 08
---
<html lang="es">
  <head><title>rominarotela</title></head>
  <body><h1>Setup OK</h1></body>
</html>
```

## Validación de Fase

```bash
npm install
npx astro check        # Sin errores fatales
npm run dev            # Arranca en localhost, muestra "Setup OK"
```

## Siguiente fase

→ @.claude/plans/phases/phase-02-types-utils.md
