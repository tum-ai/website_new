---
name: cms-content-model
description: Change a Sanity type, GROQ query, runtime content parser, generated types, synthetic CMS fixtures or the public getNotes/getPartners/getResearch contracts. Use for page content slices and CMS single-source migrations as well as events, research and organizations.
---

# Change the CMS content model

Use the single-source contract in `docs/adr/0009-cms-content-source.md` and the ownership map in
`docs/cms-content-inventory.md`. Editable page content comes from the explicitly selected
page-content dataset (`redesign`); required content must be complete. Do not add local editable
payloads, fallback merging, source selectors, backfill builders or a slice registry.

## 1. Schema and ownership

Edit schemas using `defineType` / `defineField`. Page-content types live under
`src/sanity/schemas/content/`, registered in `contentSchemaTypes`; register singleton types in
`contentSingletons` with the fixed ID equal to their type. Base event/research/legacy-partner
schemas remain compatible with `production`. Additional organization references on event and
research variants live in `content/live-references.ts`; preserve existing CMS string fields.

Use required validation for fields the page needs, enum lists for TypeGen unions, image fields
with alt/crop/hotspot, and placeholder validation for editable copy. A person or organization
identity uses a reference. Keep a campaign's featured event weak so deleting an event is allowed.
Document which collections and fields are optional and can be cleared.

## 2. Query and reader

Wrap GROQ in `defineQuery`. Project only needed fields, stable aliases and arrays; filter and
order in GROQ. Use `CONTENT_IMAGE_PROJECTION` / `toContentImage` for serializable image props.
Avoid `coalesce` values that silently invent missing required editorial content.

A slice starts with `import "server-only"` and calls
`loadContent({ query, params, tags, label, select })`. It validates projected CMS content in
`select`. Required singletons, facts and structural invariants throw an actionable content error
if missing or malformed. Optional collections can return `[]`; optional cleared fields stay
empty. Arrays replace wholesale, and grouped values such as a quote and speaker must be parsed
as a coherent group. No `fallback` or `mockDocuments` arguments remain.

Include `content:<type>` tags for every type read, including references. Page code awaits the
reader and passes plain props to islands. Shared helpers belong in `lib`; another feature reads
through the owner's `server.ts`, never a client-safe `index.ts`. Client modules cannot import
readers, `config/content-tokens.ts`, fixtures or Node helpers.

Facts in editable copy use `{{placeholders}}`, filled per render by `getContentTokens()` and
`fillCmsCopy`. New placeholders update `lib/content-tokens.ts` and
`config/content-tokens.ts` together. A count known only by a page is declared as a page token in
the schema and filled with `fillPageTokens`. Standing CTA labels stay in
`config/calls-to-action.ts`.

## 3. Generated types

Run `pnpm sanity:typegen` after schema or query changes; include the generated
`src/lib/sanity.types.generated.ts` in the authorized delivery. Never hand-edit it. TypeGen
extracts with a placeholder dataset so content types are included; CI checks freshness.
`src/lib/types.ts` derives app types from the generated ones.

## 4. Synthetic fixtures

Page fixtures are small independent CMS-shaped documents under `src/lib/cms-fixtures/`:
`settings`, `organizations`, `community`, `programmes`, `hackathons`. Update the affected fixture
and referenced synthetic documents, not a builder from real page payloads. `cms-content-mock.ts`
evaluates the actual GROQ with `groq-js`, including dereferences and image asset metadata.
`src/lib/mock-cms.ts` supplies the separate event/research mock data.

Use synthetic content, neutral links and shipped fixture assets without personal data. Cover
missing required fields, empty optional lists, cleared optional images/text and reference
failures. The literal mock gate is `USE_MOCK_CMS=1 && !VERCEL`, inlined at build time and ignored
on Vercel. Build/perf CI and Playwright fix `MOCK_CMS_NOW=2026-10-01T12:00:00Z`.

## 5. Tests and readiness

Test GROQ with `groq-js` and test the same runtime parser used by a real reader. Cover required
failure and intentional optional clearing; do not compare to a removed code content source.
Keep import-boundary and public API tests meaningful. If a test mocks `cms-content-mock`, call
one reader at a time (see `docs/testing.md` for Vitest's concurrent-import caveat).

Normally run lint, typecheck and affected tests; honor an explicit task-scoped no-tests request.
CI owns full unit/build/performance/E2E/visual checks. Mock checks are synthetic evidence only.
`pnpm sanity:ready --dataset redesign` separately uses real published runtime queries/parsers
with mocking disabled and reports missing/malformed live content. Do not call a dataset ready
without a fresh successful live check.

## Partners and public compatibility

A partner is an `organization` with a `partnerTier`, `partnerFeatured`, `partnerCategory` and
optional hidden `legacyPartnerId`. `getPartners()` serves the page directory; logo-list references
own membership/order per surface. Partner schema/projection/parser changes must also preserve
`/api/getPartners`, which supports both organization and legacy CMS partner representations.
Keep `PUBLIC_PARTNER_ORGANIZATIONS_QUERY` and `PUBLIC_PARTNERS_QUERY` in the same response shape.
`/api/getNotes`, `/api/getPartners`, `/api/getResearch` serve published content and are consumed
outside this repo. Renaming/removing response fields needs a migration note and authorization.

## Maintainer tools

Production copy, targeted migrations, asset repair and readiness are independent commands in
ADR 0009. `sanity:copy-production` reads live published source documents and skips existing target
IDs; it never overwrites. Partner migration uses existing CMS organization/partner records only;
organization-reference migration matches CMS key/name/shortName and creates nothing. Keep the
content-dedup historical comparators and revision guards exact.

`sanity:migrate-single-source` plans remaining known gaps, not a full seed. `sanity:repair-assets`
uses the existing pending-assets ledger, preserves revisions/editor removal and defaults to dry
run. Helpers belong under `scripts/sanity/`; runtime modules never import them. Keep pending
editorial image sources local until the separately authorized upload/link is confirmed. Focused
migration uploads use `.sanity-backfill/<dataset>.single-source-assets.json`, a source-path/digest
cache of completed upload IDs; retain it for retries after write failures. It is separate from
the historical `pending-assets.json` ledger used only by `sanity:repair-assets`. Focused target
writes commit their durable CMS completion receipt atomically, so completed creates/fields are
not restored after editor deletion/unset. With a read token, preflight inspects raw drafts;
without it, report draft visibility unknown. Projected readiness uses simulated images and
cannot certify uploads, draft safety or full live readiness.

Never execute a migration/repair `--apply`, dataset creation or import as part of code delivery.
These are separate maintainer launch actions. Existing draft/live preview behavior remains in
scope for event/research changes; do not expand page-content drafts in an unrelated change.
