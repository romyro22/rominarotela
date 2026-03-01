# Common Patterns

## 1. Route Handler (Worker Fetch Entry Point)

```typescript
import type { Env } from "./types/env";
import { handleGetArtwork } from "./routes/artworks";
import { handleGetTranslations } from "./routes/i18n";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/api/artworks") return handleGetArtwork(request, env);
      if (url.pathname === "/api/i18n") return handleGetTranslations(request, env);

      return new Response("Not Found", { status: 404 });
    } catch (error) {
      console.log(JSON.stringify({
        event: "error.worker.unhandled",
        path: url.pathname,
        errorMessage: error instanceof Error ? error.message : "Unknown",
        fixSuggestion: "Check route handler for unhandled edge cases",
      }));
      return Response.json(
        { success: false, error: { code: "INTERNAL", message: "Internal server error" } },
        { status: 500 }
      );
    }
  },
} satisfies ExportedHandler<Env>;
```

## 2. D1 Query (Parameterized with Typed Results)

```typescript
import type { Artwork } from "../types/artwork";

export async function getArtworksByTechnique(
  db: D1Database,
  technique: string,
  limit: number = 20
): Promise<Artwork[]> {
  const result = await db
    .prepare("SELECT id, title, technique, imageUrl FROM artworks WHERE technique = ? LIMIT ?")
    .bind(technique, limit)
    .all<Artwork>();
  return result.results;
}
```

## 3. i18n Translation Lookup

```typescript
const translations: Record<string, Record<string, string>> = {
  es: { "hero.title": "Portfolio", "gallery.search": "Buscar obras" },
  en: { "hero.title": "Portfolio", "gallery.search": "Search artworks" },
};

export function getTranslation(locale: string, key: string): string {
  const validLocale = locale === "en" ? "en" : "es";
  return translations[validLocale][key] ?? key;
}

export function getAllTranslations(locale: string): Record<string, string> {
  const validLocale = locale === "en" ? "en" : "es";
  return translations[validLocale] ?? translations["es"];
}
```
