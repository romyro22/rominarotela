# Architecture

## Directory Structure

```
rominarotela/
├── src/
│   ├── pages/
│   │   ├── index.astro              # Portfolio page (SSR, ES default + EN via /en/)
│   │   ├── galeria.astro            # Gallery page (SSR, D1 artworks, R2 images)
│   │   └── api/
│   │       ├── artworks/
│   │       │   ├── index.ts         # GET list + POST create (auth)
│   │       │   └── [id].ts          # GET one + PUT update + DELETE (auth)
│   │       └── images/
│   │           ├── upload.ts        # POST multipart upload to R2 (auth)
│   │           └── [...key].ts      # GET serve image from R2 (public)
│   ├── components/                  # Astro components
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
│   │   └── BaseLayout.astro         # Base HTML layout with head/meta
│   ├── services/                    # Business logic (pure functions, bindings as params)
│   │   ├── artwork-service.ts       # D1 CRUD for artworks
│   │   ├── image-service.ts         # R2 operations (upload, get, delete, list)
│   │   └── cache-service.ts         # KV cache utilities
│   ├── types/                       # Shared TypeScript types
│   │   ├── artwork.ts               # Artwork, ArtworkRow, CreateArtworkInput, UpdateArtworkInput
│   │   ├── env.ts                   # Env bindings (DB, CACHE, STORAGE, ASSETS, API_KEY)
│   │   └── api.ts                   # ApiSuccess<T>, ApiError, ApiResponse<T>
│   ├── utils/                       # Utility functions
│   │   ├── response.ts              # jsonSuccess(), jsonError() helpers
│   │   ├── auth.ts                  # isAuthorized() Bearer token validation
│   │   └── mapper.ts                # rowToArtwork() D1 row ↔ TS object conversion
│   ├── i18n/
│   │   ├── translations.ts          # All ES/EN translation key-value pairs
│   │   └── utils.ts                 # t(), localizedField(), getCvPath()
│   └── styles/
│       └── global.css               # Design system (custom properties, grids, cards)
├── public/                          # Static assets served via Workers Static Assets
│   ├── img/                         # Portfolio screenshots, logos
│   └── docs/                        # CV PDFs
├── migrations/                      # D1 SQL migration files
│   ├── 0001_create_artworks.sql
│   └── 0002_seed_artworks.sql
├── scripts/
│   ├── migrate-images.ts            # One-time R2 image upload script
│   └── security-audit.sh            # Grep-based security pattern scanner
├── tests/
│   ├── api/                         # API route handler tests
│   │   ├── artworks.test.ts
│   │   └── images.test.ts
│   ├── services/                    # Service layer tests
│   │   ├── artwork-service.test.ts
│   │   └── cache-service.test.ts
│   ├── utils/                       # Utility function tests
│   │   ├── auth.test.ts
│   │   ├── mapper.test.ts
│   │   └── response.test.ts
│   ├── helpers/
│   │   └── mock-context.ts          # createMockContext() for handler testing
│   └── cloudflare-test.d.ts         # Type augmentation for cloudflare:test env
├── astro.config.ts
├── wrangler.jsonc
├── tsconfig.json
├── biome.jsonc
├── vitest.config.ts
├── package.json
├── CLAUDE.md
├── .dev.vars                        # Local secrets (gitignored)
└── .gitignore
```

## Design Decisions

- **Astro API routes** in `src/pages/api/` — convention over configuration (file-based routing)
- **Services** as pure functions with bindings as parameters — testable without mocking
- **Pages** handle HTTP request/response; **services** contain business logic; **types** define contracts
- **Static assets** in `public/` served via Workers Static Assets binding
- **Migrations** in `migrations/` as numbered SQL files (applied via `wrangler d1 migrations`)
- **Env bindings** typed in `src/types/env.ts` — single source of truth for `DB`, `CACHE`, `STORAGE`, `ASSETS`, `API_KEY`
- **Test helper** `createMockContext()` builds an APIContext with real D1/KV/R2 from `cloudflare:test`
