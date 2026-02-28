# Cloudflare Workers Full-Stack Development — Complete Reference

## Stack Overview

| Layer | Service | Purpose |
|---|---|---|
| **Compute** | Workers | Serverless functions at the edge (200+ cities) |
| **Frontend** | Workers Static Assets | Serve HTML/CSS/JS from the same Worker |
| **Database** | D1 | Serverless SQLite with edge replication |
| **Cache / KV** | KV | Key-value store (high-read, low-write) |
| **Object Storage** | R2 | S3-compatible, zero egress fees |
| **Stateful** | Durable Objects | WebSockets, real-time, consistent state |
| **CLI** | Wrangler (v4+) | Dev, build, deploy, migrations — everything |

---

## Ubuntu Setup

### Prerequisites

```bash
# Node.js (v18+ required)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node -v    # v22.x
npm -v     # 10.x

# Git
sudo apt install -y git
```

### Wrangler CLI

```bash
# Install globally
npm install -g wrangler

# Authenticate (opens browser, one-time)
wrangler login

# Verify
wrangler whoami
```

### Project Scaffolding

```bash
# Create a new project (interactive — picks framework, language, etc.)
npm create cloudflare@latest my-app

# Or manually
mkdir my-app && cd my-app
npm init -y
npm install wrangler --save-dev
```

---

## Languages

| Language | Support Level |
|---|---|
| **TypeScript** | First-class, recommended |
| **JavaScript** | First-class |
| **Python** | Supported (Workers Python runtime) |
| **Rust** | Supported (compiled to Wasm) |
| **Any → Wasm** | C, C++, Go, etc. via WebAssembly |

**Recommendation:** Use **TypeScript** — best tooling, docs, and community support.

---

## Database (D1)

D1 is serverless SQLite. Standard SQL, no connection strings, no server to manage.

### CLI Commands

```bash
# Create database
wrangler d1 create my-db

# Create migration
wrangler d1 migrations create my-db "create_users_table"

# Apply locally (dev)
wrangler d1 migrations apply my-db --local

# Apply to production
wrangler d1 migrations apply my-db --remote

# Interactive SQL shell
wrangler d1 execute my-db --local --command "SELECT * FROM users"
```

### Usage in Code

```typescript
export default {
  async fetch(request: Request, env: Env) {
    // Query
    const users = await env.DB.prepare("SELECT * FROM users WHERE active = ?")
      .bind(1)
      .all();

    // Insert
    await env.DB.prepare("INSERT INTO users (name, email) VALUES (?, ?)")
      .bind("Alice", "alice@example.com")
      .run();

    return Response.json(users.results);
  }
};
```

### Free Tier Limits

| Resource | Free Allowance |
|---|---|
| Reads | 5M / day |
| Writes | 100K / day |
| Storage | 5 GB |

---

## Project Configuration — wrangler.jsonc

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "my-app",
  "main": "./src/index.ts",
  "compatibility_date": "2025-06-05",
  "compatibility_flags": ["nodejs_compat"],

  // Static assets (frontend)
  "assets": {
    "directory": "./dist/public",
    "binding": "ASSETS",
    "not_found_handling": "single-page-application"
  },

  // D1 Database
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "my-db",
      "database_id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
    }
  ],

  // KV Namespace
  "kv_namespaces": [
    {
      "binding": "CACHE",
      "id": "your-kv-namespace-id"
    }
  ],

  // R2 Bucket
  "r2_buckets": [
    {
      "binding": "STORAGE",
      "bucket_name": "my-files"
    }
  ],

  // Observability (logs)
  "observability": {
    "enabled": true,
    "head_sampling_rate": 1
  },

  // Custom domain
  "routes": [
    { "pattern": "myapp.example.com", "custom_domain": true }
  ]
}
```

---

## Daily Workflow (CLI Only — No CI/CD Required)

```bash
# 1. Develop locally with hot reload
wrangler dev

# 2. Test with local D1
wrangler d1 migrations apply my-db --local

# 3. Deploy to production (globally, in seconds)
wrangler deploy

# 4. Apply DB migrations to production
wrangler d1 migrations apply my-db --remote

# 5. Check logs
wrangler tail
```

---

## Git Repository Structure

```
my-app/
├── src/
│   ├── index.ts            # Worker entry point (backend + routing)
│   └── ...                 # Additional modules
├── dist/public/            # Built frontend assets (or framework output)
├── migrations/
│   ├── 0001_create_users.sql
│   └── 0002_add_posts.sql
├── wrangler.jsonc           # Cloudflare config (bindings, assets, etc.)
├── CLAUDE.md                # Claude Code instructions + CF best practices
├── package.json
├── tsconfig.json
└── .dev.vars                # Local secrets (gitignored)
```

**.gitignore essentials:**
```
node_modules/
dist/
.wrangler/
.dev.vars
```

---

## Framework Compatibility

| Framework | CF Workers Support | Notes |
|---|---|---|
| **SvelteKit** | Excellent | `@sveltejs/adapter-cloudflare` |
| **Astro** | Excellent | `@astrojs/cloudflare` adapter |
| **Nuxt 3** | Excellent | Built-in Cloudflare preset |
| **React Router (Remix)** | Excellent | Native CF adapter |
| **Next.js** | Good (via OpenNext) | Some features may lag |
| **Vite + React** | Excellent | No framework, just Vite |
| **Hono** | Excellent | Lightweight, API-first |

---

## MCP Servers for Claude Code

### Installation

```bash
# Install Claude Code
npm install -g @anthropic-ai/claude-code

# Initialize in your project
cd my-app
claude /init
```

### Required MCP Servers

Add these to your Claude Code configuration:

#### 1. Cloudflare API MCP (manage Workers, D1, KV, R2)

```bash
claude mcp add-json "cloudflare-api" '{
  "command": "npx",
  "args": ["@cloudflare/mcp-server-cloudflare@latest"],
  "env": {
    "CLOUDFLARE_API_TOKEN": "your-api-token"
  }
}'
```

**What it does:** Create/deploy Workers, manage D1 databases, read/write KV and R2, view analytics — all via natural language.

#### 2. Cloudflare Docs MCP (search documentation)

```bash
claude mcp add-json "cloudflare-docs" '{
  "command": "npx",
  "args": ["mcp-remote", "https://docs.mcp.cloudflare.com/sse"]
}'
```

**What it does:** Lets Claude Code search Cloudflare's entire documentation to answer questions about APIs, limits, configuration, and best practices.

#### 3. Cloudflare Observability MCP (logs & debugging)

```bash
claude mcp add-json "cloudflare-observability" '{
  "command": "npx",
  "args": ["mcp-remote", "https://observability.mcp.cloudflare.com/sse"]
}'
```

**What it does:** Check logs, find exceptions, and debug production errors — the AI agent can diagnose issues automatically.

### Alternative: Cloudflare Skills Plugin (all-in-one)

Instead of adding MCP servers individually, install the bundled plugin:

```bash
# Works with Claude Code, OpenCode, Codex, Pi
# Bundles all MCP servers + contextual skills + slash commands
```

See: https://github.com/cloudflare/skills

---

## CLAUDE.md Template (for Claude Code)

Place this in your project root:

```markdown
# Project: My Cloudflare Workers App

## Stack
- Runtime: Cloudflare Workers (TypeScript)
- Database: D1 (SQLite)
- Cache: KV
- Storage: R2
- CLI: Wrangler v4+

## Commands
- `wrangler dev` — local development
- `wrangler deploy` — deploy to production
- `wrangler d1 migrations apply my-db --local` — run migrations locally
- `wrangler d1 migrations apply my-db --remote` — run migrations in prod
- `wrangler tail` — stream production logs

## Rules
- All bindings accessed via `env` parameter (env.DB, env.CACHE, env.STORAGE)
- Use `wrangler.jsonc` for config (not .toml)
- Local secrets go in `.dev.vars` (never commit)
- Production secrets set via `wrangler secret put SECRET_NAME`
- D1 migrations go in `migrations/` folder as SQL files
- Use `nodejs_compat` compatibility flag for Node.js APIs
- Set observability.enabled = true in wrangler.jsonc
- Use Workers Static Assets for frontend (not deprecated Pages)
```

---

## Free Tier Summary

| Service | Free Allowance |
|---|---|
| **Workers Requests** | 100K / day |
| **Workers CPU Time** | 10ms per invocation |
| **D1 Reads** | 5M / day |
| **D1 Writes** | 100K / day |
| **D1 Storage** | 5 GB |
| **KV Reads** | 100K / day |
| **KV Writes** | 1K / day |
| **R2 Storage** | 10 GB |
| **R2 Class A Ops** | 1M / month |
| **R2 Class B Ops** | 10M / month |
| **Bandwidth** | **Unlimited** |
| **Build Minutes** | 3,000 / month |

---

## Quick Reference Commands

```bash
# === SETUP ===
npm install -g wrangler                   # Install CLI
wrangler login                            # Authenticate
npm create cloudflare@latest my-app       # New project

# === DEVELOP ===
wrangler dev                              # Local dev server
wrangler dev --remote                     # Dev against remote services

# === DATABASE ===
wrangler d1 create my-db                  # Create D1 database
wrangler d1 migrations create my-db "name" # New migration file
wrangler d1 migrations apply my-db --local  # Run locally
wrangler d1 migrations apply my-db --remote # Run in production
wrangler d1 execute my-db --command "SQL"   # Ad-hoc query

# === STORAGE ===
wrangler kv namespace create CACHE        # Create KV namespace
wrangler r2 bucket create my-files        # Create R2 bucket

# === SECRETS ===
wrangler secret put API_KEY               # Set production secret
# Local secrets: edit .dev.vars file

# === DEPLOY ===
wrangler deploy                           # Ship to production
wrangler deployments list                 # View history
wrangler rollback                         # Revert last deploy

# === DEBUG ===
wrangler tail                             # Stream live logs
wrangler tail --format pretty             # Formatted logs
```
