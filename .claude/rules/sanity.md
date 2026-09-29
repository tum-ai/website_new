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

One dataset (docs/adr/0009-cms-content-source.md): `NEXT_PUBLIC_SANITY_DATASET`, `redesign` for
the new site, holds the copies of the old site's events, research projects and partners
(`lib/sanity.ts`) and the page content moving out of code, read through content slices
(`lib/cms-content.ts`) behind `CMS_CONTENT_SOURCE` (`code` by default). The default when unset is
`production`, the old site's dataset: `main` renders it, nothing here writes to it, and page
content never goes there (`datasetHoldsPageContent` in `lib/sanity-config.ts`: the Studio drops
the content types and the `sanity` source renders code). Everything not yet moved is static in
Git.

- **Content slices:** `features/<x>/content.ts` (or `<topic>-content.ts`, server only) with
  `get<Thing>()` via `loadContent` and `build<X>Backfill()`, registered in
  `scripts/sanity/slices.ts`; schemas in `src/sanity/schemas/content/` (never in
  `schemas/index.ts`, which the Studio registers on `production` too); a parity test per slice. The `cms-content-model` skill ("Content slices") has the steps.
  Facts in copy are filled per render with `await getContentTokens()`, never with the module
  constant `contentTokens`. Never import `lib/cms-content`, a slice or `config/content-tokens`
  from a client component: other features reach a slice through the feature's `server.ts`, and
  `src/architecture.test.ts` fails when a `"use client"` module reaches `server-only`.
- **References:** a copy field that names a person or organisation is a `reference`
  (`homeCopy.partners.quote`, `journeyStep.evidence.person`), projected to what the code shape
  holds (`quote->key`, `person->name`). Its backfill uses the target's deterministic id
  (`personId`, `organizationId`), and the slice's `mockDocuments` include the target documents so
  the mock resolves it.
- **Cache tags:** a slice's `tags` name `content:<type>` for every type its query reads,
  dereferenced ones included (`lib/cache-tags.ts`); the event, partner and research getters use
  `liveCacheTags`.
  `/api/revalidate` (a Sanity webhook, `SANITY_REVALIDATE_SECRET`) expires them on publish; a
  missing tag means that page ignores the type's edits until its timer (at most an hour: the site
  layout's `revalidate = 3600` safety net).
- **Backfill:** `pnpm sanity:backfill --dataset redesign` is a dry run that writes
  `.sanity-backfill/<dataset>.ndjson`: the code content plus a read-only copy of `production`'s
  published events, partners and research (`scripts/sanity/production-copy.ts`: same `_id`s,
  images as CDN `_sanityAsset`s, events' `hosts` from `liveEventHosts` in `lib/mock-cms.ts`,
  failing on an entry that matches no event). It needs `NEXT_PUBLIC_SANITY_PROJECT_ID` and
  refuses `production` as a target. Never run `--apply`, `sanity dataset create` or
  `sanity dataset import` as part of a change: importing is a maintainer's launch step. `--apply`
  only creates missing documents, then attaches the images its imports left without a file,
  tracked in `.sanity-backfill/<dataset>.pending-assets.json` so an image an editor removed stays
  removed (`scripts/sanity/repair-assets.ts`); `--apply --overwrite` replaces existing ones with
  the code content or the copy and **discards editors' edits**. Backfill ids come from explicit
  keys in the code data (`id`/`key`), never from text.
- **Studio:** one workspace at `/studio` on `NEXT_PUBLIC_SANITY_DATASET` (`studioConfig` in
  `src/sanity/sanity.config.ts`) with Presentation; the content types and the merged desk
  (`siteStructure` in `src/sanity/content-structure.ts`) only when the dataset is not
  `production`.

- **Change flow** (the `cms-content-model` skill has the steps): schema in `src/sanity/schemas/`,
  then the GROQ query in `src/lib/sanity-queries.ts` (wrapped in `defineQuery`), then
  `pnpm sanity:typegen`, then the mock fixtures in `src/lib/mock-cms.ts`, then tests, then the UI.
- **Types:** `src/lib/sanity.types.generated.ts` is generated from the Studio's schema (extracted
  with a placeholder dataset so the content types are in it); never edit it
  (a hook blocks it).
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
- **Schemas and Studio config** import only `sanity` packages, `src/sanity` and `lib` (relative
  paths, which the Sanity CLI resolves for schema extraction).
- **Tests:** `src/lib/sanity-queries.test.ts` evaluates each query against sample documents with
  groq-js, so a projection change needs a matching test case; `src/lib/mock-cms.test.ts` checks the
  fixtures. Mock `next/headers` and `next-sanity` with `vi.mock` when testing the fetch layer.
  Content slices need no fixtures: under the mock their backfill documents are queried with the
  real GROQ (`lib/cms-content-mock.ts`), and each slice's parity test compares that with code.
  A test that `vi.mock`s `lib/cms-content-mock` calls one getter at a time: Vitest hands the mock
  only to the first of several concurrent dynamic imports (`docs/testing.md`).
