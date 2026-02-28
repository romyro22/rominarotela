# Command Authoring Guide

## File Structure

Commands live in `.claude/commands/` as Markdown with optional YAML frontmatter.
Subdirectories create namespaces: `github/create-pr.md` becomes `/github:create-pr`.

```
.claude/commands/
├── plan-plus.md         # /plan-plus
├── validate.md          # /validate
├── github/
│   └── create-pr.md     # /github:create-pr
└── utility/
    └── prime.md          # /utility:prime
```

## Command Anatomy

```markdown
---
description: Short description shown in command list.
---

# Command Title

## Step 1: Gather context
Read relevant files and CLAUDE.md for project conventions.

## Step 2: Execute the action
Run concrete commands or make code changes.

## Step 3: Report results
Produce structured summary: what was done, pass/fail, next steps.
```

## Design Principles

| Principle | Description |
|---|---|
| Self-contained | Works without additional context beyond CLAUDE.md |
| Project-agnostic | No hardcoded paths; use relative project structure |
| Structured output | Define what the command produces (plan, report, diff) |
| Action-oriented | Each step is a concrete action |
| Idempotent | Safe to run multiple times |

## Naming Conventions

- Lowercase kebab-case filenames: `create-pr.md`
- Verb-first names: `create-pr`, `run-tests`, `check-types`
- Group related commands in subdirectories: `github/`, `utility/`

## Categories

| Category | Examples |
|---|---|
| PIV Loop | `/plan-plus`, `/execute`, `/validate` |
| Validation | `/lint`, `/typecheck`, `/test` |
| GitHub | `/create-pr`, `/review-pr` |
| Utility | `/prime`, `/migrate`, `/scaffold` |

## Checklist

- [ ] Works standalone (no prior context needed)?
- [ ] References CLAUDE.md for conventions?
- [ ] All bash commands executable from project root?
- [ ] Produces structured, actionable output?
- [ ] Description frontmatter present?
- [ ] Handles "nothing to do" case?
- [ ] Idempotent (safe to re-run)?
