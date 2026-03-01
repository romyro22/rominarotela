# Core Principles

## Type Safety

TypeScript strict mode (`"strict": true` in tsconfig.json) is mandatory. NO `any` without explicit `// @ts-expect-error` justification comment.

## KISS + YAGNI + Three-Feature Rule

- 1st occurrence: inline
- 2nd occurrence: duplicate is acceptable
- 3rd occurrence: extract to `src/shared/`

## Naming

Verbose, intention-revealing names. camelCase for variables/functions, PascalCase for types/interfaces.

## Documentation

TSDoc format for all exported functions and types.

## Security

No hardcoded secrets — use `.dev.vars` + `wrangler secret`. Validate input at API boundaries. Parameterized D1 queries only.

## File Size

Target < 300 lines per file. Split if exceeding.

## Examples

```typescript
// GOOD: verbose naming, typed parameters, TSDoc
/** Filters artworks by technique and returns matching entries. */
async function filterArtworksByTechnique(
  db: D1Database,
  technique: string
): Promise<Artwork[]> {
  const result = await db
    .prepare("SELECT * FROM artworks WHERE technique = ?")
    .bind(technique)
    .all<Artwork>();
  return result.results;
}

// BAD: vague names, no types, no docs, string interpolation in query
async function get(db, t) {
  return await db.prepare(`SELECT * FROM artworks WHERE technique = '${t}'`).all();
}
```
