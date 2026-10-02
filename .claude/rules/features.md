---
paths:
  - "src/features/**"
---

# Feature folders (`src/features/<domain>`)

One folder per domain: `home`, `apply`, `community`, `events`, `hackathons`, `e-lab`, `partners`,
`projects`, `qanda`, `research`, `legal`, `design-system` (dev only).

- **Layout:** `<domain>-page.tsx` exports the page component the route renders (for example
  `PartnersPage`). Sections and islands sit beside it (or in `sections/`), static copy in `data/`,
  domain logic in `*.ts`, tests next to the file they test. Every folder needs a `-page.tsx`.
- **Imports:** own files; `@/components/ds` (the barrel); `@/components/shell/*`;
  `@/components/json-ld`; `@/config/*`; `@/lib/*`. Another feature only through its entries,
  `@/features/partners` (its `index.ts`) or `@/features/partners/server`, never a deep path.
  `src/architecture.test.ts` enforces this.
- **`index.ts`** is optional and minimal: export only what another feature uses. Never re-export a
  page, and never export a module that imports CSS: Turbopack would ship that page's client islands
  and styles to every page importing the index. It stays isomorphic: nothing it reaches imports
  `server-only`, so client islands may use it.
- **`server.ts`** is the optional server-only entry: it starts with `import "server-only"` and
  exports what reads the CMS (content getters, their backfill builders, async server components
  such as `MembershipApplyButton`). Import it only from server modules; the architecture test
  fails when any `"use client"` module reaches `server-only`, `next/headers`, `next/cache` or a
  Node built-in.
- **CSS:** never import CSS from a feature file. Page CSS (`<domain>.css`) is imported by the
  route file in `src/app/(site)/<route>/page.tsx`.
- **Server first:** `"use client"` only on leaf islands (dialogs, filters, carousels). Fetch and
  shape data on the server and pass plain props. No `new Date()` or locale formatting during a
  client render; compute dates on the server in Europe/Berlin (`@/lib/munich-time`, `@date-fns/tz`).
- **Use the design system:** `PageHero`, `SectionHeader`, `Section`, `StatGrid`, `Ledger`,
  `KeyDates`, `DayRuler`, `Steps`, `IndexList`, `Photo`, `QuoteCard` (with `editorial` and
  `ruled`), `PersonCard`, `LogoTile`, `LogoWall`, `FaqSection` (or `FaqList` inside a custom
  band), `CtaBand`, `BulletList`, `Actions`, and `Anchor` for links that bring their own styling.
  If one lacks a variant you need, note it as a ds handoff rather than forking it.
- **Tokens only:** no hex, `rgb()`, stock palette or arbitrary font sizes. Use the `zoom-media`
  (with `group/zoom`) and `scroll-mt-header` utilities for hover zoom and anchor offsets.
- **Copy and facts:** facts per render from `await getSiteFacts()` and the windows
  (`@/config/*-content`), the config constants only as the code fallback; copy from the page's
  content slice (`content.ts`), with its code fallback in `data/`; the standing CTA labels from
  `@/config/calls-to-action`; no em or en dashes in visible text.
- **Tests:** logic in `*.test.ts`; islands in `*.test.tsx` with Testing Library and `axe()`; the
  E2E specs cover every route in `siteRoutes` (`e2e/fixtures.ts`). CI runs them; locally only
  `pnpm exec vitest run` on the tests you touched.
