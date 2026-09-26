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
  then the GROQ query in `src/lib/sanity-queries.ts` (wrapped in `defineQuery`, coming in
  W1-Data), then `pnpm sanity:typegen` (coming in W1-Data), then the mock fixtures in
  `src/lib/mock-cms.ts`, then tests, then the UI.
- **Types:** `src/lib/sanity.types.generated.ts` (coming in W1-Data) is generated; never edit it (a hook
  blocks it). Until it lands, `src/lib/types.ts` holds the hand-written shapes; keep them in sync
  with the query projection.
- **Fetching:** `src/lib/sanity.ts` is `server-only`. Pages call its getters
  (`getSanityEvents`, `getSanityResearchProjects`, `getSanityPartners`), which return `[]` when
  Sanity is not configured and the fixtures when `USE_MOCK_CMS=1`.
- **Tokens:** `SANITY_API_READ_TOKEN` stays on the server. Never pass it to `browserToken` or a
  client component (W1-Data is fixing the current `browserToken`).
- **Draft mode:** Presentation in `/studio` calls `/api/draft-mode/enable`; a disable route and a
  clear 401/503 without a token are coming in W1-Data.
- **Public API:** `/api/getNotes` (returns events), `/api/getPartners`, `/api/getResearch` are
  consumed outside this repo. Keep response shapes stable and serve the published perspective.
- **Mock CMS:** fixtures follow the query projections exactly, use neutral links and shipped
  assets, and contain no personal data. It is never active on Vercel.
- **Schemas and Studio config** import only `sanity` packages, `src/sanity` and `lib`.
- **Tests:** `src/lib/sanity-queries.test.ts` evaluates each query against sample documents with
  groq-js, so a projection change needs a matching test case; `src/lib/mock-cms.test.ts` checks the
  fixtures. Mock `next/headers` and `next-sanity` with `vi.mock` when testing the fetch layer.
