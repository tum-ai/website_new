---
paths:
  - "src/sanity/**"
  - "src/lib/sanity*"
  - "src/lib/mock-cms*"
  - "src/lib/cms-*"
  - "src/lib/*-content.ts"
  - "src/lib/content-tokens.ts"
  - "src/features/**/*content.ts"
  - "src/config/*-content.ts"
  - "scripts/sanity/**"
  - "src/app/api/**"
---

# Sanity CMS, data fetching and API routes

Two datasets (docs/adr/0009-cms-content-source.md). The **live dataset** holds events, research
projects and partners (`lib/sanity.ts`; the old site on `main` renders it too: never add types or
write to it). The **content dataset** (`NEXT_PUBLIC_SANITY_CONTENT_DATASET`) holds page content
moving out of code, read through content slices (`lib/cms-content.ts`) behind
`CMS_CONTENT_SOURCE` (`code` by default). Everything not yet moved is static in Git.

- **Content slices:** `features/<x>/content.ts` (server only) with `get<Thing>()` via
  `loadContent` and `build<X>Backfill()`, registered in `scripts/sanity/slices.ts`; schemas in
  `src/sanity/schemas/content/` (the `content` workspace only); a parity test per slice. The
  `cms-content-model` skill ("Content slices") has the steps. Never import `lib/cms-content` or a
  `content.ts` from a client component.
- **Backfill:** `pnpm sanity:backfill` is a dry run that writes `.sanity-backfill/<dataset>.ndjson`.
  Never run `--apply`, `sanity dataset create` or `sanity dataset import` as part of a change:
  importing is a maintainer's launch step.
- **Studio:** two workspaces, `live` (`/studio/live`, Presentation) and `content`
  (`/studio/content`); `/studio` redirects to the first.

- **Change flow** (the `cms-content-model` skill has the steps): schema in `src/sanity/schemas/`,
  then the GROQ query in `src/lib/sanity-queries.ts` (wrapped in `defineQuery`), then
  `pnpm sanity:typegen`, then the mock fixtures in `src/lib/mock-cms.ts`, then tests, then the UI.
- **Types:** `src/lib/sanity.types.generated.ts` is generated from both workspaces; never edit it
  (a hook blocks it).
  `src/lib/types.ts` derives the app types from it. CI's Typecheck job runs
  `pnpm sanity:typegen:check` and fails when the file is stale.
- **Fetching:** `src/lib/sanity.ts` is `server-only`. Pages call its getters
  (`getSanityEvents`, `getSanityResearchProjects`, `getSanityPartners`), which return `[]` when
  Sanity is not configured or a fetch fails (logged), and the fixtures when the build had
  `USE_MOCK_CMS=1`.
- **Tokens:** `SANITY_API_READ_TOKEN` stays on the server. Never pass it to `browserToken` or a
  client component; the browser only ever gets the separate, optional `SANITY_API_BROWSER_TOKEN`.
- **Draft mode:** Presentation in `/studio/live` calls `/api/draft-mode/enable` (503 without a token,
  401 for a wrong secret); `/api/draft-mode/disable` redirects to same-origin paths only.
- **Public API:** `/api/getNotes` (returns events), `/api/getPartners`, `/api/getResearch` are
  consumed outside this repo. They use their own frozen `PUBLIC_*` queries; keep response shapes
  stable and serve the published perspective.
- **Mock CMS:** fixtures follow the query projections exactly, use neutral links and shipped
  assets, and contain no personal data. `USE_MOCK_CMS` is inlined at build time
  (`next.config.ts`), and the gate is off on Vercel. Fixture dates are relative to `MOCK_CMS_NOW`
  (`lib/mock-cms-env.ts`) when set.
- **Schemas and Studio config** import only `sanity` packages, `src/sanity` and `lib` (relative
  paths, which the Sanity CLI resolves for schema extraction).
- **Tests:** `src/lib/sanity-queries.test.ts` evaluates each query against sample documents with
  groq-js, so a projection change needs a matching test case; `src/lib/mock-cms.test.ts` checks the
  fixtures. Mock `next/headers` and `next-sanity` with `vi.mock` when testing the fetch layer.
  Content slices need no fixtures: under the mock their backfill documents are queried with the
  real GROQ (`lib/cms-content-mock.ts`), and each slice's parity test compares that with code.
