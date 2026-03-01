# PIV Loop Quick Reference

```
    +------+       +-----------+       +----------+
    | PLAN | ----> | IMPLEMENT | ----> | VALIDATE |
    +------+       +-----------+       +----------+
        ^                                    |
        +----------  ITERATE  <--------------+
```

## Phases

### 1. Plan

Define what to build before writing code. Decompose into small, testable tasks
with acceptance criteria. Output: numbered task list in `.claude/plan/`.

Command: `/plan-plus`

### 2. Implement

Execute tasks one at a time from the plan. Types first, then services, routes, tests.
Follow CLAUDE.md conventions strictly.

Command: `/execute`

### 3. Validate

Run all quality checks. Fix every error before proceeding.

```bash
npx biome check src/ && npx tsc --noEmit && npx vitest --run
```

Command: `/validate`

### 4. Iterate

Fix failures found during validation, then validate again.
If fixes require design changes, return to Plan phase.

## Anti-Patterns

| Anti-Pattern | Consequence | Fix |
|---|---|---|
| Skipping plan | Scope creep, rework | Always plan first |
| Implementing everything at once | Hard to debug | One task at a time |
| Ignoring validation failures | Broken code | Fix every error |
| Not iterating | Bugs accumulate | Loop until all checks pass |
| Plan without acceptance criteria | No definition of done | Define "done" per task |
| Over-planning | Analysis paralysis | 5-15 tasks max |

## Quick Reference

| Phase | Command | Input | Output |
|---|---|---|---|
| Plan | `/plan-plus` | Feature description | Task list in `.claude/plan/` |
| Implement | `/execute` | Plan file | Code changes |
| Validate | `/validate` | Modified files | Pass/fail report |
| Iterate | (manual) | Validation errors | Fixes, re-validate |
