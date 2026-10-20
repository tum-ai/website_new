# 0006: Sanity TypeGen

- **Status:** Accepted
- **Date:** 2026-09-26 (W1-Data, #267)

## Context

The types for CMS data were written by hand in `src/lib/types.ts`. Enumerated fields such as the
event category and city or the research status were typed as plain `string`, shape types were
duplicated, and research keywords were joined into a string in GROQ only to be split again in the
UI. Nothing checked that a query projection and its type agreed.

## Decision

- GROQ queries in `src/lib/sanity-queries.ts` are wrapped in `defineQuery`.
- `pnpm sanity:typegen` extracts the schema from `src/sanity/schemas/` and generates
  `src/lib/sanity.types.generated.ts`, including enum unions from `options.list` fields.
  `src/lib/types.ts` derives the app types from it.
- The generated file is never edited by hand; a Claude Code hook blocks it, and the Typecheck CI
  job runs `pnpm sanity:typegen:check`, which regenerates and fails on any diff.
- Projections return what the UI needs in its natural shape (keywords as an array).

## Consequences

- A schema or query change that the types don't reflect fails CI.
- Changing the content model is a fixed sequence: schema, query, typegen, fixtures, tests, UI
  (the `cms-content-model` skill).
- The public API routes have their own frozen `PUBLIC_*` queries with shape tests, so a change for
  the pages can't change the external response by accident.
- knip reports the generated file and `src/sanity/sanity.cli.ts` until its config lists them.

## Sources

- #267 (What: Sanity TypeGen, Queries; Handoffs: `knip.json`)
- Cleanup audit (P1 architecture: "Types are hand-written")
