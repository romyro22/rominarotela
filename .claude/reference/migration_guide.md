# Migration Guide -- Static HTML to Workers + TypeScript

How to migrate features from `index.html` / `galeria.html` to Cloudflare Workers.

## Step 1: Identify the Feature

| Feature | Location | Destination |
|---|---|---|
| i18n translations | `galeria.html` `<script>` | `src/i18n/translations.ts` |
| Artworks data | `galeria.html` `<script>` | D1 table via `migrations/` |
| Portfolio sections | `index.html` HTML | D1 or KV |
| Images | `img/` directory | R2 bucket |
| CV/PDFs | `docs/` directory | R2 bucket |

## Step 2: Extract Data -- Translations Example

Before (inline JS):
```javascript
const translations = { es: { 'page.title': 'Galeria de Arte' }, en: { ... } };
```

After (`src/i18n/translations.ts`):
```typescript
export type Locale = "es" | "en";
export interface TranslationKeys {
  "page.title": string;
  "search.placeholder": string;
  "filter.all": string;
  "modal.size": string;
  "modal.technique": string;
}

export const translations: Record<Locale, TranslationKeys> = {
  es: { "page.title": "Galeria de Arte", "search.placeholder": "Buscar...",
        "filter.all": "Todas", "modal.size": "Tamano", "modal.technique": "Tecnica" },
  en: { "page.title": "Art Gallery", "search.placeholder": "Search...",
        "filter.all": "All", "modal.size": "Size", "modal.technique": "Technique" },
};
```

## Step 3: Extract Data -- Artworks to D1

```sql
-- migrations/0001_create_artworks.sql
CREATE TABLE artworks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description TEXT NOT NULL,
  description_en TEXT NOT NULL,
  technique TEXT NOT NULL,
  technique_en TEXT NOT NULL,
  size TEXT NOT NULL,
  image_key TEXT NOT NULL,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT DEFAULT (datetime('now'))
);

-- migrations/0002_seed_artworks.sql
INSERT INTO artworks (id, title, title_en, description, description_en, technique, technique_en, size, image_key, tags)
VALUES
  ('perla_inu', 'Perla Inu', 'Perla Inu', 'Una reinterpretacion...', 'A reinterpretation...', 'Oleo sobre lienzo', 'Oil on canvas', '40x30cm', 'galeria/pintura.png', '["oleo"]');
```

Apply: `wrangler d1 migrations apply rominarotela-db --local`

## Step 4: Create Worker Route

```typescript
// src/routes/artworks.ts
import type { Env } from "../types/env";

export async function handleListArtworks(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const technique = url.searchParams.get("technique");
  let query = "SELECT * FROM artworks";
  const bindings: string[] = [];
  if (technique) { query += " WHERE technique = ?"; bindings.push(technique); }
  const result = await env.DB.prepare(query).bind(...bindings).all();
  return Response.json({ success: true, data: result.results });
}
```

## Step 5: Move Static Assets to R2

```bash
# Upload gallery images
for file in img/galeria/*.png; do
  wrangler r2 object put rominarotela-assets/galeria/"$(basename "$file")" --file "$file"
done

# Upload PDFs
wrangler r2 object put rominarotela-assets/docs/cv_rominarotela.pdf --file docs/cv_rominarotela.pdf
```

Serve via Worker:
```typescript
// src/routes/assets.ts
export async function handleAsset(request: Request, env: Env): Promise<Response> {
  const key = new URL(request.url).pathname.replace("/assets/", "");
  const object = await env.STORAGE.get(key);
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
}
```

## Step 6: Update Frontend

Replace inline data with API fetch:
```typescript
async function loadArtworks(technique?: string): Promise<Artwork[]> {
  const params = new URLSearchParams();
  if (technique) params.set("technique", technique);
  const res = await fetch(`/api/artworks?${params}`);
  const body = await res.json();
  if (!body.success) throw new Error(body.error.message);
  return body.data;
}
```

## Step 7: Remove Old Inline Code

1. Remove `artworks` array and `translations` object from `galeria.html`
2. Replace inline `<script>` with `<script src="/app.js">` calling the API
3. Keep HTML shells until full frontend migration completes

## Checklist

- [ ] Feature identified in static HTML
- [ ] Data extracted to typed module or D1 migration
- [ ] Worker route serves the data
- [ ] Frontend fetches from API instead of inline data
- [ ] Images/PDFs uploaded to R2 with cache headers
- [ ] Migrations applied locally and tested
- [ ] Old inline code removed or marked for removal
- [ ] `npx biome check src/ && npx tsc --noEmit && npx vitest --run` passes
