# Plan: Inicialización del Stack Cloudflare Workers

**Fecha:** 2026-02-28
**Estado:** pendiente
**Confianza:** 9/10

## Descripción

Inicializar la infraestructura completa del proyecto: npm, TypeScript, Wrangler, Biome, Vitest, y un Worker entry point mínimo que sirva los assets estáticos existentes (HTML, imágenes, PDFs). No incluye D1, KV, R2, ni rutas API — solo la fundación.

## User Story

Como desarrolladora del portfolio, quiero tener el stack de Cloudflare Workers configurado y funcionando localmente, para poder comenzar la migración incremental del contenido HTML a TypeScript.

## Enfoque Seleccionado

**Scaffolding manual controlado** — crear cada archivo de configuración manualmente para que coincida exactamente con las convenciones definidas en CLAUDE.md. No usamos `npm create cloudflare` porque genera estructura/archivos que no necesitamos y no coinciden con nuestras reglas.

## Decisiones Técnicas

- **`wrangler.jsonc` (no `.toml`)**: definido en las reglas del proyecto, permite comentarios JSON
- **Static Assets en `public/`**: los archivos HTML, img/ y docs/ se mueven a `public/` para ser servidos por Workers Static Assets
- **Entry point `src/index.ts`**: Worker mínimo que deja pasar requests a static assets y devuelve 404 para rutas API inexistentes
- **Sin D1/KV/R2 bindings aún**: solo `ASSETS` binding — los demás se agregan cuando se necesiten
- **`nodejs_compat` flag**: requerido para APIs de Node.js en Workers
- **Biome como único linter/formatter**: reemplaza ESLint + Prettier
- **Vitest con `@cloudflare/vitest-pool-workers`**: testing nativo en el runtime de Workers

## Archivos a Leer (antes de implementar)

- `.claude/sections/02_tech_stack.md` — versiones exactas requeridas
- `.claude/sections/03_architecture.md` — estructura de directorios target
- `.claude/sections/04_code_style.md` — convenciones de naming
- `.claude/sections/08_dev_commands.md` — scripts que deben funcionar
- `.claude/plans/cloudflare-stack-resume.md` — referencia completa del stack CF
- `index.html` — verificar rutas de assets (img/, docs/) para saber qué mover
- `galeria.html` — verificar rutas de assets de galería

## Tareas

### Tarea 1: Inicializar npm y dependencias

- [ ] CREATE `package.json` — ejecutar `npm init -y` y ajustar name/description/scripts
- [ ] ADD dependencia `wrangler` (devDependency) — CLI de Cloudflare Workers
- [ ] ADD dependencia `typescript` (devDependency) — compilador TypeScript
- [ ] ADD dependencia `@biomejs/biome` (devDependency) — linter/formatter
- [ ] ADD dependencia `vitest` (devDependency) — test runner
- [ ] ADD dependencia `@cloudflare/vitest-pool-workers` (devDependency) — Workers test pool
- [ ] ADD dependencia `@cloudflare/workers-types` (devDependency) — tipos del runtime Workers
- [ ] UPDATE `package.json` — agregar scripts: `dev`, `deploy`, `check`, `test`, `typecheck`
- [ ] VALIDATE: `npm install` completa sin errores

**Scripts esperados en package.json:**
```json
{
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "check": "biome check src/",
    "check:fix": "biome check --write src/",
    "test": "vitest run",
    "typecheck": "tsc --noEmit",
    "validate": "biome check src/ && tsc --noEmit && vitest run"
  }
}
```

### Tarea 2: Configuración de TypeScript

- [ ] CREATE `tsconfig.json` — strict mode, target ES2022, moduleResolution bundler, Workers types, paths a src/

**Contenido esperado:**
```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "lib": ["ES2022"],
    "types": ["@cloudflare/workers-types/2023-07-01", "@cloudflare/vitest-pool-workers"],
    "resolveJsonModule": true,
    "isolatedModules": true,
    "forceConsistentCasingInFileNames": true,
    "jsx": "react-jsx"
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] VALIDATE: `npx tsc --noEmit` (fallará hasta tarea 4, pero tsconfig debe ser parseable)

### Tarea 3: Configuración de Biome

- [ ] CREATE `biome.json` — formatter + linter, indent 2 spaces, line width 100

**Contenido esperado:**
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
    "rules": {
      "recommended": true
    }
  },
  "files": {
    "ignore": ["node_modules", "dist", ".wrangler"]
  }
}
```

- [ ] VALIDATE: `npx biome check src/` (fallará hasta tarea 5, pero config debe ser parseable)

### Tarea 4: Configuración de Wrangler

- [ ] CREATE `wrangler.jsonc` — Workers con Static Assets apuntando a `public/`

**Contenido esperado:**
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "rominarotela",
  "main": "src/index.ts",
  "compatibility_date": "2026-02-17",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": "./public",
    "binding": "ASSETS"
  },
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1
  }
}
```

- [ ] VALIDATE: `npx wrangler deploy --dry-run` (verifica que el config es válido)

### Tarea 5: Mover assets estáticos a public/

- [ ] CREATE directorio `public/`
- [ ] UPDATE mover `index.html` → `public/index.html`
- [ ] UPDATE mover `galeria.html` → `public/galeria.html`
- [ ] UPDATE mover `img/` → `public/img/`
- [ ] UPDATE mover `docs/` → `public/docs/`
- [ ] VALIDATE: verificar que las rutas internas en los HTML (src="img/...", href="docs/...") siguen funcionando (son relativas, deberían funcionar)

### Tarea 6: Crear entry point del Worker

- [ ] CREATE `src/index.ts` — Worker mínimo con fetch handler

**Contenido esperado:**
```typescript
import type { Env } from "./types/env";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // API routes will be added here during migration
    if (url.pathname.startsWith("/api/")) {
      return Response.json(
        { success: false, error: { code: "NOT_FOUND", message: "API route not found" } },
        { status: 404 }
      );
    }

    // All other requests fall through to static assets (served by Workers Static Assets)
    return new Response("Not Found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
```

- [ ] CREATE `src/types/env.ts` — tipo Env con binding ASSETS

**Contenido esperado:**
```typescript
/** Environment bindings available to the Worker. */
export interface Env {
  /** Workers Static Assets binding for serving HTML, images, and PDFs. */
  ASSETS: Fetcher;
}
```

- [ ] VALIDATE: `npx tsc --noEmit` pasa sin errores

### Tarea 7: Configuración de Vitest

- [ ] CREATE `vitest.config.ts` — defineWorkersConfig con wrangler.jsonc

**Contenido esperado:**
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

- [ ] CREATE `tests/index.test.ts` — test básico del Worker entry point

**Contenido esperado:**
```typescript
import { describe, it, expect } from "vitest";
import { SELF } from "cloudflare:test";

describe("Worker entry point", () => {
  it("should return 404 JSON for unknown API routes", async () => {
    const response = await SELF.fetch("https://example.com/api/unknown");

    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body).toEqual({
      success: false,
      error: { code: "NOT_FOUND", message: "API route not found" },
    });
  });

  it("should return 404 for non-asset, non-API routes", async () => {
    const response = await SELF.fetch("https://example.com/nonexistent");

    expect(response.status).toBe(404);
  });
});
```

- [ ] VALIDATE: `npx vitest run` pasa

### Tarea 8: Actualizar .gitignore

- [ ] UPDATE `.gitignore` — agregar entradas estándar para el stack

**Contenido esperado:**
```
node_modules/
dist/
.wrangler/
.dev.vars
*.log
```

- [ ] REMOVE la entrada `CLAUDE.md` del .gitignore (CLAUDE.md ya está commiteado y referenciado)
- [ ] VALIDATE: `git status` muestra archivos esperados

### Tarea 9: Validación completa

- [ ] VALIDATE: `npx biome check src/` — sin errores de lint/format
- [ ] VALIDATE: `npx tsc --noEmit` — sin errores de tipos
- [ ] VALIDATE: `npx vitest run` — tests pasan
- [ ] VALIDATE: `npx wrangler dev` — servidor local arranca y sirve index.html en http://localhost:8787

## Estrategia de Testing

- **Tests unitarios:** Worker entry point responde correctamente a rutas API (404 JSON) y rutas desconocidas (404)
- **Tests de integración:** Vitest con pool de Workers simula el runtime real de CF
- **Cobertura objetivo:** 100% del entry point mínimo (2 branches: /api/* y fallthrough)

## Criterios de Aceptación

- [ ] `npm install` completa sin errores
- [ ] `npm run validate` (`biome check + tsc + vitest`) pasa completamente
- [ ] `npx wrangler dev` sirve `index.html` en localhost:8787
- [ ] `npx wrangler dev` sirve `galeria.html` en localhost:8787/galeria.html
- [ ] Las imágenes cargan correctamente desde `/img/`
- [ ] Los PDFs son accesibles desde `/docs/`
- [ ] Requests a `/api/*` devuelven JSON 404 estructurado
- [ ] TypeScript strict mode activo sin errores
- [ ] Biome pasa sin warnings

## Suite de Validación

```bash
npx biome check src/
npx tsc --noEmit
npx vitest run
npx wrangler dev  # manual: verificar localhost:8787
```

## Estructura del Codebase (tras implementación)

```
rominarotela/
├── public/                   # Static assets (served by Workers)
│   ├── index.html
│   ├── galeria.html
│   ├── img/
│   │   ├── galeria/
│   │   └── *.png, *.jpg
│   └── docs/
│       ├── cv_rominarotela.pdf
│       └── cv_rominarotela_en.pdf
├── src/
│   ├── index.ts              # Worker entry point (fetch handler)
│   └── types/
│       └── env.ts            # Env bindings type
├── tests/
│   └── index.test.ts         # Entry point tests
├── .claude/                  # AI layer (rules, plans, sections)
├── node_modules/
├── package.json
├── package-lock.json
├── tsconfig.json
├── biome.json
├── vitest.config.ts
├── wrangler.jsonc
├── CLAUDE.md
└── .gitignore
```
