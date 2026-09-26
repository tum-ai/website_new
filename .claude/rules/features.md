---
paths:
  - "src/features/**"
---

# Feature folders (`src/features/<domain>`)

One folder per domain: `home`, `apply`, `community`, `events`, `e-lab`, `partners`, `projects`,
`qanda`, `research`, `legal`, `design-system` (dev only).

- **Layout:** `<domain>-page.tsx` exports the page component the route renders (for example
  `PartnersPage`). Sections and islands sit beside it (or in `sections/`), static copy in `data/`,
  domain logic in `*.ts`, tests next to the file they test. Every folder needs a `-page.tsx`.
- **Imports:** own files; `@/components/ds` (the barrel); `@/components/shell/*`;
  `@/components/json-ld`; `@/config/*`; `@/lib/*`. Another feature only through its index
  (`@/features/partners`), never a deep path. `src/architecture.test.ts` enforces this.
- **`index.ts`** is optional and minimal: export only what another feature uses. Never re-export a
  page, and never export a module that imports CSS: Turbopack would ship that page's client islands
  and styles to every page importing the index.
- **CSS:** never import CSS from a feature file. Page CSS (`<domain>.css`) is imported by the
  route file in `src/app/(site)/<route>/page.tsx`.
- **Server first:** `"use client"` only on leaf islands (dialogs, filters, carousels). Fetch and
  shape data on the server and pass plain props. No `new Date()` or locale formatting during a
  client render; compute dates on the server in Europe/Berlin (`@/lib/munich-time`, `@date-fns/tz`).
- **Use the design system:** `PageHero`, `SectionHeader`, `Section`, `StatGrid`, `CtaBand`,
  `FaqSection`, `Steps`, `Timeline`, `MediaCard`, `QuoteCard`, `PersonCard`, `LogoTile`,
  `Actions`. If one lacks a variant you need, note it as a ds handoff rather than forking it.
- **Tokens only:** no hex, `rgb()`, stock palette or arbitrary font sizes. Use the `zoom-media`
  and `scroll-mt-header` utilities for hover zoom and anchor offsets (coming in W1-DS).
- **Copy and facts:** facts from `@/config/*`; copy in `data/`; no em or en dashes in visible text.
- **Tests:** logic in `*.test.ts`; islands in `*.test.tsx` with Testing Library and `axe()`; the
  route's E2E spec (coming in W1-E2E) covers the page.
