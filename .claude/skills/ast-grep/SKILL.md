# ast-grep -- Structural Code Search & Refactoring

## Overview

ast-grep (`sg`) searches and transforms code using **AST patterns** instead of regex.
`$fn($$$args)` matches any function call regardless of whitespace or formatting.

## When to Use

- Find specific code structures (all `Response.json()` calls, unused imports)
- Enforce conventions (named exports only, no `any` types)
- Security audits (raw SQL without `.bind()`)
- Large-scale refactoring (rename patterns, update API signatures)

## 5-Step Workflow

1. **Understand** -- identify the code structure to find (think AST nodes, not text)
2. **Example** -- write a minimal snippet containing the target pattern
3. **Rule** -- translate into an ast-grep pattern: `sg run --pattern 'env.DB.prepare($SQL).all()' --lang ts src/`
4. **Test** -- verify with `--debug-query ast` to inspect the parse tree
5. **Search** -- run against `src/` and review matches

## CLI Quick Reference

```bash
# Pattern search
sg run --pattern '$PATTERN' --lang ts src/

# Inline YAML rule
sg run --inline-rules '{ id: rule, language: typescript, rule: { pattern: "console.log($$$ARGS)" } }' src/

# Scan with rule files
sg scan --rule rules/

# Debug AST parse
sg run --pattern '$PATTERN' --debug-query ast src/

# Replace (refactor)
sg run --pattern 'console.log($$$ARGS)' --rewrite 'logger.info($$$ARGS)' --lang ts src/

# JSON output
sg run --pattern '$PATTERN' --lang ts --json src/
```

## Tips

- Start with `--pattern` before writing YAML rules
- Use `--debug-query ast` when a pattern does not match
- `$VAR` = one node, `$$$VAR` = zero or more, `$_` = wildcard (no capture)
- Combine atomic rules with `all`, `any`, `not` for precision

## Common Use Cases

| Goal | Pattern |
|---|---|
| Find `console.log` | `console.log($$$ARGS)` |
| Find raw SQL (no bind) | `env.DB.prepare($SQL).all()` |
| Find default exports | `export default $EXPR` |
| Find `any` types | `$VAR: any` |

## Reference

Full rule syntax: `@.claude/skills/ast-grep/references/rule_reference.md`
