# Architecture

## Target Directory Structure

```
rominarotela/
├── src/
│   ├── index.ts              # Worker entry point (fetch handler)
│   ├── routes/               # API route handlers
│   │   ├── artworks.ts
│   │   ├── portfolio.ts
│   │   └── i18n.ts
│   ├── services/             # Business logic
│   │   ├── artwork-service.ts
│   │   └── translation-service.ts
│   ├── types/                # Shared TypeScript types
│   │   ├── artwork.ts
│   │   ├── portfolio.ts
│   │   └── env.ts
│   └── utils/                # Utility functions
│       ├── response.ts
│       └── sanitize.ts
├── public/                   # Static assets (images, PDFs)
├── migrations/               # D1 SQL migration files
├── tests/                    # Vitest test files
│   ├── routes/
│   └── services/
├── wrangler.jsonc            # Cloudflare Workers config
├── tsconfig.json
├── biome.json
├── package.json
├── CLAUDE.md
└── .claude/                  # AI Layer
```

## Design Decisions

- **Flat module structure** — project is too small for Vertical Slice Architecture
- **Routes** handle HTTP request/response; **services** contain business logic; **types** define contracts
- **Static assets** in `public/` served via Workers Static Assets binding
- **Migrations** in `migrations/` as numbered SQL files (applied via `wrangler d1 migrations`)
- **Legacy HTML files** (`index.html`, `galeria.html`) remain at root during migration
- **Env bindings** typed in `src/types/env.ts` — single source of truth for `DB`, `CACHE`, `ASSETS`
