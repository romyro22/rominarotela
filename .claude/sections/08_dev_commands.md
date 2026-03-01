# Dev Commands

## Install

```bash
npm install
```

## Dev Server

```bash
wrangler dev
```

## Deploy

```bash
wrangler deploy
```

## Database (D1)

```bash
wrangler d1 migrations create portfolio-db "description"
wrangler d1 migrations apply portfolio-db --local
wrangler d1 migrations apply portfolio-db --remote
```

## Testing

```bash
npx vitest
npx vitest --coverage
```

## Lint + Format

```bash
npx biome check src/ tests/
npx biome check --write src/ tests/
```

## Type Check

```bash
npx tsc --noEmit
```

## Logs (Production)

```bash
wrangler tail
```

## Security Audit

```bash
npm run security-audit
```

## Full Validation (run before commit)

```bash
npx biome check src/ tests/ && npx tsc --noEmit && npx vitest run
```
