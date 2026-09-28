---
paths:
  - "src/sanity/**"
  - "src/lib/sanity*"
  - "src/lib/mock-cms*"
  - "src/app/api/**"
---

# Sanity CMS, data fetching and API routes

Events, research projects and partners come from Sanity. Everything else is static in Git.

- **Change flow** (the `cms-content-model` skill has the steps): schema in `src/sanity/schemas/`,
  then the GROQ query in `src/lib/sanity-queries.ts` (wrapped in `defineQuery`), then
  `pnpm sanity:typegen`, then the mock fixtures in `src/lib/mock-cms.ts`, then tests, then the UI.
- **Types:** `src/lib/sanity.types.generated.ts` is generated; never edit it (a hook blocks it).
  `src/lib/types.ts` derives the app types from it. CI's Typecheck job runs
  `pnpm sanity:typegen:check` and fails when the file is stale.
- **Fetching:** `src/lib/sanity.ts` is `server-only`. Pages call its getters
  (`getSanityEvents`, `getSanityResearchProjects`, `getSanityPartners`), which return `[]` when
  Sanity is not configured or a fetch fails (logged), and the fixtures when the build had
  `USE_MOCK_CMS=1`.
- **Tokens:** `SANITY_API_READ_TOKEN` stays on the server. Never pass it to `browserToken` or a
  client component; the browser only ever gets the separate, optional `SANITY_API_BROWSER_TOKEN`.
- **Draft mode:** Presentation in `/studio` calls `/api/draft-mode/enable` (503 without a token,
  401 for a wrong secret); `/api/draft-mode/disable` redirects to same-origin paths only.
- **Public API:** `/api/getNotes` (returns events), `/api/getPartners`, `/api/getResearch` are
  consumed outside this repo. They use their own frozen `PUBLIC_*` queries; keep response shapes
  stable and serve the published perspective.
- **Mock CMS:** fixtures follow the query projections exactly, use neutral links and shipped
  assets, and contain no personal data. `USE_MOCK_CMS` is inlined at build time
  (`next.config.ts`), and the gate is off on Vercel. Fixture dates are relative to `MOCK_CMS_NOW`
  (`lib/mock-cms-env.ts`) when set.
- **Schemas and Studio config** import only `sanity` packages, `src/sanity` and `lib`.
- **Tests:** `src/lib/sanity-queries.test.ts` evaluates each query against sample documents with
  groq-js, so a projection change needs a matching test case; `src/lib/mock-cms.test.ts` checks the
  fixtures. Mock `next/headers` and `next-sanity` with `vi.mock` when testing the fetch layer.
