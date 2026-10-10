# 0009: CMS as the single source of editable content

- **Status:** Accepted, revised for the approved single-source architecture
- **Date:** 2026-09-29; revised 2026-10-03

## Context

The initial migration used code payloads as fallback content, slice builders as a full backfill,
and a source selector. That made a missing CMS field look valid and prevented editors from
clearing content. The revised decision removes that parallel editorial source. The new site
reads editable content from its one Sanity dataset; small synthetic fixtures support local
work and CI.

The old site owns `production`. Its published events, partners and research remain available
for a read-only copy into `redesign`. Migration tools refuse `production` as a target, preserve
existing target documents, and require a separate maintainer launch action for CMS writes.

## Decision

### One explicit page-content dataset

`NEXT_PUBLIC_SANITY_PROJECT_ID` and `NEXT_PUBLIC_SANITY_DATASET=redesign` configure the site and
its embedded Studio. Page-content readers require an explicitly selected dataset with page
content. A missing project, an unset dataset, or `production` is a configuration error for those
readers. There is no source selector and no implicit local editorial content.

`CMS_CONTENT_SOURCE`, local editable payloads, `build*Backfill` builders and the slice registry
are removed. Domain types, parsers, derived logic and structural interface wording remain in
code. Legal wording, canonical URLs, SEO structure, navigation and standing CTA labels remain
reviewed code concerns. Rendered editable facts come from CMS readers, including the layout,
copy tokens and fact-dependent metadata.

### Required content and optional collections

Server-only slices run real GROQ through `fetchContent` / `loadContent` in
`src/lib/cms-content.ts`, then validate the result. Required page-copy singletons, site settings,
application windows and required structural content fail visibly when absent or malformed.
Errors identify the content and reason; a failed request does not quietly recreate a page from
repository payloads. Studio validation complements the runtime parser, since published legacy
documents can predate the schema.

An optional collection may be empty and renders its normal empty or omitted state. Empty
arrays replace content wholesale. Optional text or images that an editor clears stay cleared;
there is no field-level merge or per-item resurrection. An unresolved required reference is an
error, while an optional reference follows its documented empty-state contract. Shape coupled
values such as a quote and its speaker together so they cannot be paired with unrelated data.

Facts inside CMS copy remain `{{placeholders}}`, filled from `getContentTokens()` per render.
Page tokens represent counts known only to the page and use `fillPageTokens`. Client islands
receive plain props and never import CMS readers or fixture modules.

### Independent local fixtures

The small CMS-shaped document set lives under `src/lib/cms-fixtures/`, split into `settings`,
`organizations`, `community`, `programmes` and `hackathons`. It contains synthetic copy,
references and synthetic image assets. It is neither production content nor a seed for a
maintainer import. `src/lib/cms-content-mock.ts` evaluates the actual GROQ with `groq-js` over
those documents, so projections and dereferences have the same semantics as the runtime query.

The literal gate is `USE_MOCK_CMS=1 && !VERCEL`, inlined at build time by `next.config.ts`.
Fixtures are ignored on Vercel. Fixtures may use erased type-only domain imports but must not
import feature/config readers at runtime. Select the gate when building or starting development; setting
it only for `pnpm start` cannot change a completed build. CI's Build and performance job and
Playwright use `MOCK_CMS_NOW=2026-10-01T12:00:00Z` for reproducible time-dependent views.
Mock CI proves query/parser/UI behavior against synthetic data. It does not prove that the live
dataset is complete or ready.

### Legacy CMS compatibility and public APIs

Partners on page-content datasets are `organization` records with a `partnerTier`. Logo lists
own section membership and ordering through references. The old `partner` representation stays
readable for production compatibility and migration. The public `/api/getPartners` getter
preserves its organization-versus-legacy-partner fallback and stable `legacyPartnerId` mapping.
This compatibility is between CMS representations, not a return to local page content.

`/api/getNotes`, `/api/getPartners` and `/api/getResearch` retain their published perspective and
response shapes. Change both partner public projections together. Event `coHosts` and research
`institutions` can refer to organizations on page-content datasets; legacy CMS text remains
readable where that compatibility is required.

### Published page content and existing preview behavior

Page-content slices use published content and `content:<type>` tags for every type they read,
dereferenced targets included. The Sanity webhook at `/api/revalidate` expires those tags on
publish. The site's hourly layout revalidation remains a safety net. Timer-stale ISR may serve
an older render after a refresh error; cold, hard-expired and on-demand reads may propagate the
required-content error. This decision does not
expand draft mode, Presentation or live editing to page-content slices; the existing preview
behavior of the live event/research readers remains unchanged.

## Maintainer runbook

These commands are separate responsibilities. They default to dry-run/read-only behavior;
none of their `--apply` modes is part of normal code delivery. Inspect the emitted plan and
readiness report before a separately authorized maintainer launch action. No apply or launch
readiness is implied by a successful mock build.

| Command | Responsibility |
| --- | --- |
| `pnpm sanity:copy-production --dataset redesign` | Read live published `event`, `partner` and `research` documents from `production`, preserve IDs, and plan create-only copies. Existing target IDs are skipped; there is no overwrite mode. |
| `pnpm sanity:migrate-partners --dataset redesign` | Plan organization/partner changes from existing CMS records only; no local partner catalog and no uploads. |
| `pnpm sanity:migrate-org-references --dataset redesign` | Resolve existing organization keys, names and short names; report unmatched references and create no organizations. |
| `pnpm sanity:migrate-content-dedup --dataset redesign` | Preserve the exact historical comparators and revision guards for previously migrated fields. |
| `pnpm sanity:migrate-single-source --dataset redesign` | Plan only the remaining single-source content/reference gaps, preserving editor changes; not a full content backfill. |
| `pnpm sanity:repair-assets --dataset redesign` | Inspect the existing pending-assets ledger independently; only a future authorized `--apply` uploads or attaches assets. |
| `pnpm sanity:ready --dataset redesign` | Read the real published dataset through the runtime queries and parsers, with mocking disabled; report actionable missing/malformed content and references without CMS writes. |

The single-source migration focuses on missing Makeathon editions in `hackathonsCopy`, Atira,
`siteSettings.hackathons` league references, the `ehl-partners` logo list, partner hero imagery,
organization partner ordering, E-Lab voice references and hackathon case-study references.
Do not regenerate all page content from fixtures or recover missing optional content by
copying arbitrary repository strings.

### Focused migration completion and upload retries

The focused migration keeps the operational CMS receipt `migration-single-source-2026-10`
(`_type: migrationCompletion`), pinned to its migration, project and dataset. Entries use stable
target-ID keys and record completed creates or encoded field paths. A target mutation and its
completion receipt are committed in the same transaction, guarded by the existing ledger
revision; concurrent first-ledger creation conflicts safely. Completed creates stay hands-off
if an editor later deletes the document. Completed field paths stay hands-off after an editor
unsets the value. These receipts prevent reruns from resurrecting editorial removals while
allowing incomplete steps to retry.

The CLI checks drafts with a raw-perspective authenticated read when `SANITY_API_READ_TOKEN` is
available. Without it, the public published read cannot establish whether drafts exist: the
plan reports `draftVisibility: unknown`. An empty published result is not proof of no draft.
Inspect this report boundary before approving a plan; apply rechecks targets/drafts and revisions.

Images are uploaded before their references are linked. The separate local cache
`.sanity-backfill/<dataset>.single-source-assets.json` records completed upload IDs by source
path and file digest. A successful upload can therefore be reused after a revision conflict or
other document-write failure. Preserve this cache and source files until the separately
authorized apply has confirmed the document links. Digest-based upload retry is not historical
empty-image recovery and must not be routed through `sanity:repair-assets`.

### Historical import asset repair

Historical recovery keeps `.sanity-backfill/<dataset>.pending-assets.json` as a per-machine ledger.
Only an upload previously recorded there may be recovered. Repairs compare document revisions
and image paths, preserve editor removal and concurrent changes, and retain failed entries for
a later retry. An empty CMS image alone is not evidence that an upload should be restored.
Historical pending source files stay local with this ledger until the separately authorized
repair succeeds. Focused migration sources use the distinct upload-cache lifecycle above.
Ledger and migration helpers live
under `scripts/sanity/asset-ledger.ts` and `scripts/sanity/content-migration.ts`, outside the app
runtime.

Production-copy plans write `.sanity-backfill/<dataset>.production-copy.ndjson`. Readiness invokes
configuration/page readers without request-time draft APIs and writes
`.sanity-backfill/<dataset>.readiness.json`. With a reviewed `--plan`, readiness evaluates the
proposed changes in memory and writes `<dataset>.projected-readiness.json`. Planned images use
simulated metadata; a passing projection proves query/parser compatibility, not successful
uploads, linked CDN assets, draft safety or live completeness.

Before launch, inspect live readiness, complete the reviewed missing content/assets, then rerun
readiness against `redesign` without mocks. Check the real pages, the webhook and existing draft
preview, and preserve the public API response contracts. Report the dataset and time of that
check, including the plan's draft-visibility boundary. A published parser result does not prove
that unpublished drafts were inspected; unauthenticated draft status remains unknown. Repository
changes and synthetic CI do not certify fresh live readiness.

## Consequences

Editors have one source for editable content and can intentionally clear optional values.
Incomplete required content now blocks rendering or a real build and must be repaired in the
CMS, which makes readiness a launch prerequisite. Mock development remains credential-free
and deterministic, with deliberately small fixtures independent of live editorial content.
Maintenance tools target precise gaps and recorded asset failures rather than overwriting the
dataset from a second source of truth.
