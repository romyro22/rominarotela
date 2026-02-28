# Logging

## Runtime

Workers use `console.log()` — output captured by Wrangler locally and Cloudflare observability in production.

## Format

Structured JSON via `console.log(JSON.stringify({ ... }))`.

## Event Naming

Pattern: `domain.action.status` — e.g., `gallery.search.completed`, `i18n.switch.started`, `artwork.fetch.failed`.

## Rules

- Never log secrets — mask sensitive values: `apiKey.slice(0, 8) + "..."`
- Never log inside loops — log batch summaries after the loop
- Include `fixSuggestion` in error logs
- Include context: IDs, duration, expected vs actual

## Examples

```typescript
// GOOD: structured, actionable, masked
console.log(JSON.stringify({
  event: "artwork.fetch.success",
  artworkId: "art-42",
  technique: "acuarela",
  durationMs: 23,
}));

console.log(JSON.stringify({
  event: "error.d1.query_failed",
  query: "SELECT artworks",
  errorMessage: error.message,
  fixSuggestion: "Check D1 binding name in wrangler.jsonc",
}));

// BAD: unstructured, exposes secrets, template literal
console.log(`Fetched artwork ${id} with key ${apiKey}`);
```
