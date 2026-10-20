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

# Sanity CMS, fetching and API routes

The new site reads editable content from one explicitly selected page-content dataset
(`NEXT_PUBLIC_SANITY_DATASET=redesign`); see ADR 0009 and `cms-content-model`. Production remains
the old site's dataset and is never a migration target. No source selector, local editable
payloads, fallback merge, slice builders or backfill registry remain.

- **Readers:** server-only slices call `loadContent({ query, params, tags, label, select })`.
  Validate required singletons/facts/structural invariants and throw actionable errors on missing
  or malformed data. Optional collections may be empty; cleared optional fields stay empty.
  Never repopulate a deleted image/list from repository copy.
- **References:** use CMS references for people and organizations. Parse coupled values together.
  Include `content:<type>` tags for every referenced type. Client islands get plain props;
  other features use the owner's `server.ts`. No client imports of readers or fixture modules.
- **Facts:** fill placeholders from `getContentTokens()` per render; no static filled editorial
  payload. A new placeholder updates both names and mapping. Page tokens reflect page counts.
- **Schema flow:** schema, `defineQuery` projection, runtime parser, TypeGen, independent synthetic
  fixture, affected tests and UI. Page types live under `schemas/content/`, registered outside
  production; base event/research/legacy-partner types preserve old-site compatibility.
  Schemas and Studio use relative imports resolved by the Sanity CLI.
- **Types:** regenerate `sanity.types.generated.ts` with `pnpm sanity:typegen`, never hand-edit.
  CI's Typecheck job checks freshness.
- **Partners:** pages read organizations with `partnerTier`. Logo-list references own section
  membership/order. Public partner getters retain compatibility between organization and legacy
  CMS partner records, including stable legacy IDs. Preserve all three public API shapes and
  published perspective; change both partner public projections together.
- **Maintainer tools:** `sanity:copy-production` copies live published events/partners/research,
  create-only and skipping existing IDs. `sanity:migrate-partners` uses CMS records only.
  `sanity:migrate-org-references` matches existing CMS key/name/shortName without creations.
  `sanity:migrate-content-dedup` retains historical comparators/revision guards.
  `sanity:migrate-single-source` addresses known missing content/references, not a full seed.
  These default to dry run; no `--apply`, dataset create or import during code delivery.
  Focused migration target writes and durable CMS completion receipts are atomic. Completed
  creates/field paths stay hands-off after later editor deletion/unset. Authenticated preflight
  inspects raw drafts; without a read token report draft visibility unknown, never draft-safe.
- **Assets:** independent `sanity:repair-assets --dataset redesign` defaults to dry run and uses
  the existing `.sanity-backfill/<dataset>.pending-assets.json` ledger. Preserve revision guards,
  editor removal and retry entries. New pending image sources stay local until an authorized
  apply. Focused migration uses the separate `.sanity-backfill/<dataset>.single-source-assets.json`
  source-path/digest upload cache; retain it and source files until upload/link confirmation,
  including retries after a document write fails. Ledger/migration helpers live under
  `scripts/sanity/`, never the app runtime.
- **Readiness:** `sanity:ready --dataset redesign` reads the real published dataset using runtime
  queries/parsers with mocking disabled, reports actionable gaps, and makes no CMS writes.
  Mock CI success does not certify live readiness.
- **Mock:** small CMS-shaped documents under `lib/cms-fixtures/{settings,organizations,community,
  programmes,hackathons}` are queried with actual GROQ using groq-js. The separate
  `lib/mock-cms.ts` supplies event/research mocks. The literal gate is
  `USE_MOCK_CMS=1 && !VERCEL`, inlined at build time; ignored on Vercel. Build/perf CI and
  Playwright fix `MOCK_CMS_NOW=2026-10-01T12:00:00Z`. Never import fixtures outside that gate.
- **Cache/preview:** published page-content reads use `content:<type>` tags and webhook
  revalidation with the hourly safety net. Existing event/research draft and live preview behavior
  remains; no page-content draft expansion here. Server read tokens never reach the browser;
  the browser token is separate and optional.
- **Tests:** test query/parser behavior, required failures, empty collections, optional clearing,
  references and public compatibility. Mock fetch-layer dependencies as needed. A test mocking
  `cms-content-mock` calls one getter at a time; see `docs/testing.md`. Honor no-tests requests.
