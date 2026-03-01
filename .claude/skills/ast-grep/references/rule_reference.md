# ast-grep Rule Reference

## Atomic Rules

**pattern** -- matches code by AST structure. Metavariables capture nodes.
```yaml
rule:
  pattern: console.log($MSG)
```
With context for disambiguation:
```yaml
rule:
  pattern:
    context: "const x: $TYPE = $VALUE"
    selector: variable_declarator
```

**kind** -- matches AST node types directly. Use `--debug-query ast` to discover names.
```yaml
rule:
  kind: arrow_function
```

**regex** -- matches text content of an AST node.
```yaml
rule:
  kind: comment
  regex: "TODO|FIXME|HACK"
```

**nthChild** -- matches nodes by position among siblings (1-indexed).
```yaml
rule:
  nthChild: 1
```

---

## Relational Rules

**inside** -- node must be descendant of a matching ancestor.
```yaml
rule:
  pattern: console.log($$$ARGS)
  inside:
    kind: function_declaration
```

**has** -- node must contain a matching descendant.
```yaml
rule:
  kind: function_declaration
  has:
    pattern: return $VALUE
```

**follows** / **precedes** -- sibling ordering constraints.
```yaml
rule:
  pattern: $STMT
  follows:
    pattern: "const $NAME = await $EXPR"
```

**stopBy** -- controls search depth: `end` (all), `neighbor` (direct), or a rule object.

**field** -- constrains which AST field the node occupies.
```yaml
rule:
  kind: identifier
  inside:
    kind: pair
    field: key
```

---

## Composite Rules

**all** (AND), **any** (OR), **not** (negate):
```yaml
rule:
  all:
    - pattern: $FN($$$ARGS)
    - not:
        inside:
          kind: export_statement
```

**matches** -- references a named utility rule:
```yaml
utils:
  is-console:
    any:
      - pattern: console.log($$$A)
      - pattern: console.warn($$$A)
rule:
  matches: is-console
```

---

## Metavariables

| Syntax | Meaning | Example |
|---|---|---|
| `$VAR` | Exactly one node | `$FN($ARG)` matches `foo(1)` |
| `$$VAR` | Zero or one (optional) | `export $$DEFAULT $DECL` |
| `$$$VAR` | Zero or more | `fn($$$ARGS)` matches `fn()`, `fn(a,b)` |
| `$_` | Wildcard, no capture | `$FN($_)` matches any single-arg call |

Same-name metavars must match identical code: `$VAR === $VAR` finds `x === x`.

---

## Common TypeScript Patterns

```yaml
# No `any` types
id: no-any-type
language: typescript
rule:
  pattern: "$NAME: any"
```

```yaml
# Unsafe D1 queries (no .bind)
id: unsafe-d1-query
language: typescript
rule:
  pattern: env.DB.prepare($SQL).$METHOD()
  not:
    has:
      pattern: .bind($$$PARAMS)
```

```yaml
# No console statements
id: no-console
language: typescript
rule:
  any:
    - pattern: console.log($$$A)
    - pattern: console.warn($$$A)
    - pattern: console.error($$$A)
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Pattern matches nothing | `--debug-query ast` to check AST shape |
| Matches too much | Add `inside` or `not` constraints |
| Metavar not capturing | Ensure `$VAR` aligns with AST node boundary |
| Pattern with types fails | Use `context` + `selector` |
