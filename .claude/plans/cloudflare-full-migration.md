# Plan: Migración Completa a Cloudflare Workers + Astro

**Fecha:** 2026-02-28
**Estado:** pendiente
**Confianza:** 8/10

> **Nota de confianza:** 8/10 porque Astro 6 está en beta y algunos detalles de la API de bindings (`cloudflare:workers` imports) podrían variar. La arquitectura general es sólida. Si Astro 6 no es estable al momento de ejecutar, se puede usar Astro 5 con `context.locals.runtime.env`.

## Descripción

Migración completa del portfolio y galería de arte desde HTML estático (index.html + galeria.html con CSS/JS inline y datos hardcodeados) a un stack moderno de Cloudflare Workers con:

- **Astro 6** como framework fullstack (SSR + API routes)
- **D1** como base de datos para artworks
- **R2** para almacenamiento de imágenes de la galería
- **KV** para cache de respuestas API
- **TypeScript strict mode** en todo el proyecto
- **CRUD completo** para artworks con autenticación por API key
- **i18n nativo** de Astro (ES/EN)

## User Story

Como desarrolladora del portfolio, quiero migrar mi sitio estático a Cloudflare Workers con Astro para tener un backend con base de datos, API para gestionar obras de arte, storage de imágenes en la nube, y un frontend moderno con SSR — manteniendo el diseño visual actual y el soporte bilingüe ES/EN.

## Enfoque Seleccionado

**Opción C: Astro fullstack + services layer.** Las API routes viven en `src/pages/api/` (convención Astro), pero la lógica de negocio se extrae a `src/services/` (convención CLAUDE.md). Los tipos compartidos en `src/types/`. Esto combina lo mejor de Astro (SSR, i18n, routing) con la separación de responsabilidades del proyecto.

## Decisiones Técnicas

- **Astro 6 + `@astrojs/cloudflare`**: Framework fullstack con adapter nativo para CF Workers. Dev server corre en `workerd` (misma runtime que producción).
- **`output: "server"`**: Todo se renderiza on-demand (SSR). No prerendering — el portfolio tiene i18n dinámico.
- **`wrangler.jsonc` con `main: "@astrojs/cloudflare/entrypoints/server"`**: Astro genera el entry point del Worker automáticamente.
- **D1 con snake_case en columnas, camelCase en TypeScript**: Mapper function en el service para la conversión.
- **API key auth para escritura**: Secreto en `.dev.vars` / `wrangler secret`. Solo GET es público.
- **R2 para imágenes de galería**: Imágenes de portfolio (screenshots de proyectos) permanecen en `public/img/` porque son estáticas de diseño.
- **KV cache con TTL 1h**: Invalidación explícita en operaciones de escritura.
- **Astro i18n routing**: ES como default (sin prefijo), EN con prefijo `/en/`. Páginas únicas con `Astro.currentLocale`.
- **Biome como linter/formatter**: Sin ESLint ni Prettier.
- **Vitest + `@cloudflare/vitest-pool-workers`**: Tests nativos en runtime Workers.

## Archivos a Leer (antes de implementar)

- `index.html` — contenido completo del portfolio (secciones, proyectos, i18n, CSS)
- `galeria.html` — datos de artworks, lógica de galería, modal, i18n
- `.claude/sections/02_tech_stack.md` — versiones requeridas
- `.claude/sections/03_architecture.md` — estructura de directorios target
- `.claude/sections/04_code_style.md` — convenciones de naming
- `.claude/sections/07_api_contracts.md` — response shapes
- `.claude/sections/09_common_patterns.md` — patterns de referencia
- `.claude/plans/cloudflare-stack-resume.md` — referencia completa del stack CF

## Team Architecture

Cada fase se ejecuta con un equipo de 4 agentes especializados que trabajan en pipeline secuencial.

### Roles

| Rol | Subagent Type | Herramientas Clave | Responsabilidad |
|-----|--------------|-------------------|-----------------|
| **Researcher** | `Explore` | Context7, WebSearch, WebFetch, Read, Glob, Grep | Investigar docs, buscar patterns, preparar contexto para el Engineer |
| **Engineer** | `general-purpose` | Read, Write, Edit, Bash, Glob, Grep | Implementar código según la fase y el research brief |
| **Tester** | `test-suite-architect` | Read, Write, Edit, Bash, Glob, Grep | Escribir y ejecutar tests para el código del Engineer |
| **Reviewer** | `refactoring-specialist` | Read, Edit, Glob, Grep, Bash | Code review: calidad, seguridad, patterns, performance |

### Workflow por Fase

```
┌─────────────┐    research brief    ┌──────────────┐    code    ┌──────────┐    tests    ┌──────────────┐
│  Researcher  │ ──────────────────► │   Engineer    │ ────────► │  Tester   │ ─────────► │   Reviewer   │
│              │                     │              │           │          │            │              │
│ • Read docs  │                     │ • Write code │           │ • Write  │            │ • Quality    │
│ • Context7   │                     │ • Edit files │           │   tests  │            │ • Security   │
│ • WebSearch  │                     │ • Run cmds   │           │ • Run    │            │ • Patterns   │
│ • Codebase   │                     │ • Validate   │           │   vitest │            │ • Fix issues │
└─────────────┘                     └──────────────┘           └──────────┘            └──────────────┘
```

**Cada agente recibe:**
1. El archivo de fase (`@.claude/plans/phases/phase-XX-*.md`) como contexto primario
2. Los archivos referenciados en "Leer antes de implementar" de esa fase
3. El output del agente anterior en el pipeline

### Naming Convention

Los agentes se nombran con el pattern: `{role}-p{phase_number}`

Ejemplo para Fase 05:
- `researcher-p05`
- `engineer-p05`
- `tester-p05`
- `reviewer-p05`

### Excepciones

No todas las fases necesitan los 4 roles:

| Fase | Researcher | Engineer | Tester | Reviewer | Nota |
|------|:----------:|:--------:|:------:|:--------:|------|
| 00 Cloud Resources | — | yes | — | — | Solo wrangler commands |
| 01 Scaffolding | yes | yes | — | yes | Config files, no tests aún |
| 02 Types/Utils | yes | yes | — | yes | Types compilan, no runtime tests |
| 03 D1 Schema | yes | yes | — | yes | SQL review, no vitest |
| 04 i18n | yes | yes | — | yes | Translations, no runtime tests |
| 05 Services | yes | yes | — | yes | Compilan, tests en Fase 11 |
| 06 Design/Layout | yes | yes | — | yes | Visual, no unit tests |
| 07 API Routes | yes | yes | — | yes | Endpoints, tests en Fase 11 |
| 08 Portfolio Page | yes | yes | — | yes | Visual parity check |
| 09 Gallery Page | yes | yes | — | yes | Visual + functional check |
| 10 R2 Migration | — | yes | — | — | Wrangler commands |
| 11 Testing | yes | — | yes | yes | Tester es el Engineer aquí |
| 12 Validation | — | yes | yes | yes | Suite final + manual checks |

### Prompts Base por Rol

**Researcher prompt template:**
```
You are the Researcher for Phase {XX}: {phase_name}.

Read the phase file: @.claude/plans/phases/phase-{XX}-{name}.md
Read all files listed in "Leer antes de implementar".
Research any external documentation needed (Astro, Cloudflare, D1, etc.) via Context7 and WebSearch.

Produce a RESEARCH BRIEF containing:
1. Key findings from documentation
2. Code patterns/examples found in the codebase
3. Gotchas, limitations, or version-specific notes
4. Recommended implementation approach based on findings

Do NOT write code. Only research and report.
```

**Engineer prompt template:**
```
You are the Engineer for Phase {XX}: {phase_name}.

Read the phase file: @.claude/plans/phases/phase-{XX}-{name}.md
Read the Researcher's brief for context.
Implement ALL tasks listed in the phase file.
Follow CLAUDE.md conventions strictly.

After each task group, run the VALIDATE step defined in the phase.
Mark tasks as completed.
```

**Tester prompt template:**
```
You are the Tester for Phase {XX}: {phase_name}.

Read the phase file: @.claude/plans/phases/phase-{XX}-{name}.md
Read all code written by the Engineer in this phase.
Write comprehensive tests following .claude/sections/06_testing.md conventions.

Run: npx vitest run
Target: ≥80% coverage on services, ≥70% on API routes.
```

**Reviewer prompt template:**
```
You are the Reviewer for Phase {XX}: {phase_name}.

Read the phase file: @.claude/plans/phases/phase-{XX}-{name}.md
Review ALL code written/modified by Engineer and Tester in this phase.

Check against:
- @.claude/sections/01_core_principles.md (type safety, KISS, naming)
- @.claude/sections/04_code_style.md (conventions)
- @.claude/sections/05_logging.md (structured logging)
- @.claude/sections/07_api_contracts.md (response shapes)

Report: PASS/FAIL per file with specific issues.
Fix any issues found directly.
Run: npx biome check src/ && npx tsc --noEmit
```

---

## Fases

Cada fase es un archivo independiente con sus tareas, validaciones y dependencias. Ejecutar en orden.

| # | Fase | Estado | Depende de |
|---|------|--------|------------|
| 00 | @.claude/plans/phases/phase-00-cloud-resources.md | pendiente | — |
| 01 | @.claude/plans/phases/phase-01-scaffolding.md | pendiente | Fase 00 |
| 02 | @.claude/plans/phases/phase-02-types-utils.md | pendiente | Fase 01 |
| 03 | @.claude/plans/phases/phase-03-d1-schema.md | pendiente | Fase 01 |
| 04 | @.claude/plans/phases/phase-04-i18n.md | pendiente | Fase 02 |
| 05 | @.claude/plans/phases/phase-05-services.md | pendiente | Fase 02, 03 |
| 06 | @.claude/plans/phases/phase-06-design-layout.md | pendiente | Fase 04 |
| 07 | @.claude/plans/phases/phase-07-api-routes.md | pendiente | Fase 05 |
| 08 | @.claude/plans/phases/phase-08-portfolio-page.md | pendiente | Fase 06 |
| 09 | @.claude/plans/phases/phase-09-gallery-page.md | pendiente | Fase 05, 06 |
| 10 | @.claude/plans/phases/phase-10-r2-migration.md | pendiente | Fase 07 |
| 11 | @.claude/plans/phases/phase-11-testing.md | pendiente | Fase 07, 09 |
| 12 | @.claude/plans/phases/phase-12-validation.md | pendiente | Todas |

## Orden de Ejecución

```
00 Cloud Resources (D1, KV, R2 + API_KEY secret)
 └── 01 Scaffolding (usa IDs reales de Fase 00)
      ├── 02 Types/Utils
      │    ├── 04 i18n
      │    │    └── 06 Design/Layout
      │    │         ├── 08 Portfolio Page
      │    │         └── 09 Gallery Page ──┐
      │    └── 05 Services (+ 03)         │
      │         └── 07 API Routes         │
      │              └── 10 R2 Migration  │
      ├── 03 D1 Schema                    │
      └────────────────── 11 Testing ─────┘
                           └── 12 Validation
```

## Dependencias entre Fases

```
Fase 00 (Cloud Resources) → Fase 01
Fase 01 (Scaffolding) → todas las demás
Fase 02 (Types/Utils) → Fases 04, 05, 07
Fase 03 (D1 Schema) → Fases 05, 09
Fase 04 (i18n) → Fases 06, 08, 09
Fase 05 (Services) → Fases 07, 09
Fase 06 (Design/Layout) → Fases 08, 09
Fase 07 (API Routes) → Fases 10, 11
Fase 08 (Portfolio Page) → Fase 12
Fase 09 (Gallery Page) → Fase 12
Fase 10 (R2 Migration) → Fase 12
Fase 11 (Testing) → Fase 12
```

## Criterios de Aceptación (globales)

- [ ] `npm install` completa sin errores
- [ ] `npm run validate` pasa completamente (biome + astro check + tsc + vitest)
- [ ] `npm run dev` sirve portfolio y galería en localhost
- [ ] Portfolio se ve visualmente idéntico al index.html original
- [ ] Galería carga artworks de D1 e imágenes de R2
- [ ] Búsqueda y filtro funcionan en galería
- [ ] Modal muestra datos y foto correctos
- [ ] i18n funciona: `/` (ES), `/en/` (EN), `/galeria` (ES), `/en/galeria` (EN)
- [ ] Language switcher cambia entre ES/EN sin perder la página actual
- [ ] GET `/api/artworks` devuelve JSON con 7 obras
- [ ] POST/PUT/DELETE requieren Authorization header
- [ ] POST `/api/images/upload` sube imagen a R2
- [ ] GET `/api/images/:key` sirve imagen desde R2
- [ ] KV cache funciona (segunda request es más rápida)
- [ ] `npm run build` y `npx wrangler deploy --dry-run` exitosos
- [ ] TypeScript strict mode activo, cero errores
- [ ] Biome pasa sin warnings en src/

## Suite de Validación (final)

```bash
npx biome check src/
npx astro check
npx tsc --noEmit
npx vitest run
npm run build
npx wrangler deploy --dry-run
```

## Estructura del Codebase (tras implementación)

```
rominarotela/
├── src/
│   ├── pages/
│   │   ├── index.astro                    # Portfolio (SSR, ES default + EN via /en/)
│   │   ├── galeria.astro                  # Gallery (SSR, datos de D1, imágenes de R2)
│   │   └── api/
│   │       ├── artworks/
│   │       │   ├── index.ts               # GET all + POST (auth)
│   │       │   └── [id].ts               # GET one + PUT (auth) + DELETE (auth)
│   │       └── images/
│   │           ├── upload.ts              # POST upload a R2 (auth)
│   │           └── [...key].ts            # GET imagen de R2 (público)
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── LanguageSwitcher.astro
│   │   ├── Hero.astro
│   │   ├── DevelopmentSection.astro
│   │   ├── ExperienceSection.astro
│   │   ├── SkillBadges.astro
│   │   ├── WorkProjects.astro
│   │   ├── ProjectCard.astro
│   │   ├── PersonalProjects.astro
│   │   ├── ArtworkCard.astro
│   │   ├── ArtworkModal.astro
│   │   └── GallerySearch.astro
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── services/
│   │   ├── artwork-service.ts             # D1 CRUD logic
│   │   ├── image-service.ts               # R2 operations
│   │   └── cache-service.ts               # KV cache utilities
│   ├── types/
│   │   ├── artwork.ts                     # Artwork types + DTOs
│   │   ├── env.ts                         # Env bindings type
│   │   └── api.ts                         # ApiSuccess/ApiError contracts
│   ├── utils/
│   │   ├── response.ts                    # JSON response helpers
│   │   ├── auth.ts                        # API key validation
│   │   └── mapper.ts                      # D1 row ↔ TS object conversion
│   ├── i18n/
│   │   ├── translations.ts               # All ES/EN translations
│   │   └── utils.ts                       # t(), localizedField(), getCvPath()
│   └── styles/
│       └── global.css                     # Design system (custom properties, grids, cards)
├── public/
│   ├── img/                               # Static design images (portfolio screenshots, logos)
│   └── docs/                              # CVs en PDF
├── migrations/
│   ├── 0001_create_artworks.sql           # Schema
│   └── 0002_seed_artworks.sql             # Initial 7 artworks
├── scripts/
│   └── migrate-images.ts                  # One-time R2 image upload
├── tests/
│   ├── services/
│   │   ├── artwork-service.test.ts
│   │   └── cache-service.test.ts
│   └── api/
│       ├── artworks.test.ts
│       └── images.test.ts
├── .claude/                               # AI layer
├── astro.config.ts
├── wrangler.jsonc
├── tsconfig.json
├── biome.json
├── vitest.config.ts
├── package.json
├── package-lock.json
├── CLAUDE.md
├── .dev.vars                              # Local secrets (gitignored)
└── .gitignore
```
