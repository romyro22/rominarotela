# AI Instructions

- Read existing code before modifying — match established conventions and patterns
- Run linter and type checker after every change: `npx biome check src/ && npx tsc --noEmit`
- Follow the PIV Loop — plan before implementing, validate after. Not done until all checks pass
- Use structured JSON logging — never `console.log` with template literals for production code
- Write tests for every new function — verify assertions test real domain logic, not implementation details
- Use verbose, intention-revealing names — `artworkId` not `id`, `galleryFilter` not `f`
- Load reference guides for task types: `@.claude/reference/{guide}.md`
- Keep files under 300 lines — split into separate modules if exceeding
- Explicit is better than clever — no metaprogramming, no magic, no implicit behavior
- Check existing code for similar patterns before writing new code — consistency over "better"
