# 0003: Feature folders, page modules and page-free indexes

- **Status:** Accepted
- **Date:** 2026-09-26 (W0-B, #265)

## Context

Page code was spread over four to six directories: `src/views/`, `src/components/<domain>/`,
`src/data/`, `src/lib/` and `src/styles/`. The partners page alone spanned all of them. `lib`
imported `data`, features deep-imported each other, and every design-system file depended on
event types and date-fns through `lib/utils.ts`. Seven parallel cleanup streams were about to work
on these paths.

## Decision

- Each page domain owns one folder, `src/features/<domain>/`, holding its page module
  (`<domain>-page.tsx`), sections and islands, static copy (`data/`), domain logic, page CSS and
  colocated tests. File names are kebab-case with named exports.
- Routes in `src/app/(site)/` are thin: metadata, JSON-LD and the page module.
- **A route imports exactly its page module.** A feature's `index.ts` is its API for other
  features, exists only where another feature needs something, and never re-exports a page.
  Page CSS is imported by the route file, never by feature code.
- The import rules (see [architecture.md](../architecture.md)) are enforced by
  `src/architecture.test.ts`, which parses the import graph; Biome's `noRestrictedImports` repeats
  the rules it can express.

The plan first had each feature's index export its page and routes import only the index. It was
built that way and then changed, because the build diverged from the pre-move output: Turbopack
keeps every re-exported module that has client islands or a CSS import, even when the importer
uses none of its exports. The homepage shipped the partners page's islands (a 54 KB chunk) and
`partners.css`; `/projects` shipped `ResearchCard`; `/imprint` and `/disclaimer` shipped the
privacy table of contents (+17.7 KB). The page-module rule gives zero bundle change.

## Consequences

- One folder to open per page; cross-feature reuse is explicit in a small index.
- A new page needs a route, a feature folder with a `-page.tsx`, and nothing else structural; the
  architecture test rejects other shapes.
- Features can't share code by deep import. Shared UI goes into the ds, shared logic into `lib`,
  facts into `config`.
- The restructure was verified as behaviour-neutral: identical route table, equivalent
  prerendered HTML, and 18.6 KB less JS per page because `cn` stopped pulling in date-fns.

## Sources

- #265 (How: "Import rules, and a deviation from the plan"; zero-behaviour-change evidence)
- Cleanup audit (P1 architecture), `src/architecture.test.ts`
