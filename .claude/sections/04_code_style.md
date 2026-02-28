# Code Style

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Variables, functions, params | camelCase | `artworkFilter`, `fetchPortfolio` |
| Types, interfaces, enums | PascalCase | `ArtworkResponse`, `GallerySection` |
| Environment bindings | UPPER_SNAKE_CASE access | `env.DB`, `env.CACHE`, `env.ASSETS` |
| Files | kebab-case | `artwork-service.ts`, `gallery-filter.ts` |

## Rules

- **Named exports** preferred over default exports (grep-ability)
- **Explicit typed DTOs** — no inline object literals for API responses
- **Import ordering:** node builtins, external packages, internal modules, types

## Examples

```typescript
// GOOD: named export, typed DTO, clear naming
import type { Artwork } from "../types/artwork.ts";

export interface ArtworkListResponse {
  artworks: Artwork[];
  totalCount: number;
}

export function buildArtworkListResponse(
  artworks: Artwork[],
  totalCount: number
): ArtworkListResponse {
  return { artworks, totalCount };
}

// BAD: default export, inline object, vague naming
export default function build(items, count) {
  return { items, count };
}
```
