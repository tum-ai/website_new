# CMS single-source rollout evidence

Read-only checks on 2026-10-03 used published `o9uuv2sq/redesign` documents through the direct
API. No CMS mutations, uploads or migration apply were performed.

| Check | Verified result |
|---|---|
| Live runtime readiness (2026-10-03T21:01:34.613Z) | 14/28 registered getters pass. The other 14 fail visibly, primarily through missing `siteSettings.organization.startedApplicationsPerBatch`; E-Lab voice references are also absent. |
| Proposed migration projection (2026-10-03T21:01:31.603Z) | 28/28 real getter/parser checks pass using the same GROQ over live documents plus proposed patches in memory; the separate CMS-only home quote overlay requires 0 conversions. |
| Focused migration dry run | 3 creates, 21 guarded fill steps, 0 blocked published prerequisites; draft visibility is **unknown**. |
| Home quote migration dry run | 0 conversions: published homeCopy already has editor-set join.quotes; preserved without append or replacement. Draft visibility is unknown. |
| Production copy dry run | 0 missing source IDs; 86 existing target IDs skipped; no downloads or imports. |
| Partner migration dry run | 0 creates, 0 updates, 54 unchanged organizations, 2 duplicate partner representations merged in the plan. |
| Organization-reference dry run | 0 changes/deletions/creates; 0 unmatched or blocked; 2 edited roles preserved. |
| Historical event seed removal | All 17 IDs produced from the retired seed's explicit keys already exist as published events. |
| Local asset removal | 164 files / 10,219,683 bytes removed after live CMS SHA-1 equality, caller audit and absent pending ledgers. |

The proposed plan creates `hackathonsCopy` (eight editions), `organization-atira`, and
`logolist-ehl-partners`. It fills new partner ordering, league facts and event references,
partner hero imagery, E-Lab voice selections and the missing application-count fact. Existing
editor values and revisions are preserved. Future apply writes per-step receipts atomically
with document changes to `migration-single-source-2026-10`, then marks the migration complete
only after all steps succeed. Completed steps remain untouched on partial retries. The final
handoff also protects initially existing fields and documents, so later editor unsets or
deletions cannot be restored by rerunning this migration version. No completion record was
written during these read-only checks. The exact narrow source payload lives in
`scripts/sanity/single-source-migration-data.json`; it is not a full content snapshot.

After merging the homepage quote-list change, a separate CMS-only migration preserves an
existing legacy join.quote as one join.quotes entry only when the new field is absent and the
published member's story supports that excerpt. It never appends repository copy. Existing
arrays and null stay untouched, and its independent durable completion record prevents later
editor removals from being reseeded. The fresh dry run and projection required no conversion
because the published homepage already contains join.quotes. No CMS writes were performed.

The projection simulates planned image assets from retained files' measured dimensions. It
proves query/parser compatibility only. It does **not** prove asset uploads, CDN delivery, live
CMS readiness, a real deployed preview, or fixture exclusion from an inspected production
bundle. Public preflight cannot inspect drafts: both fresh reports and the plan explicitly
record that boundary as unknown. An available `SANITY_API_READ_TOKEN` enables authenticated
raw draft preflight; future apply also reads raw drafts and guards their revisions. Those
remain separate rollout checks after the maintainer authorizes migration apply.

## CI and deployment verification

[CI run 37148785762](https://github.com/tum-ai/website_new/actions/runs/37148785762)
at commit `4ccd722e` passed all 1,216 unit tests across 150 files, all four Playwright
E2E shards, Build/performance checks, Knip, Sanity TypeGen and lint. Build and browser
checks used the explicit synthetic mock mode and fixed clock; these results do not certify
live CMS readiness.

Two reviewers inspected the expected, actual and diff captures for all 52 visual
comparisons: 13 routes at 390 and 1440 px in Chromium and WebKit. They found no unintended
layout issues. Screenshot CSS hides images, video, canvas and grain while preserving their
layout boxes; rotating regions and count-up figures are masked. This review therefore covers
layout and visible text, not image content, image rendering or CDN delivery. The initial
`/events` captures showed one co-host; the final synthetic dataset supplies two across separate
events, and the functional E2E keyboard checks pass with that fixture. A reviewer also inspected
the final events baselines at both widths in both engines at `352d36436`: the two co-hosts,
count and attribution fit without overflow, overlap, clipping or lost structure.

[Snapshot refresh run 37149263956](https://github.com/tum-ai/website_new/actions/runs/37149263956)
succeeded at tested source commit `4ccd722e`. Bot commit `352d36436` contains exactly 52
updated baseline screenshot files covering all 13 routes, both widths and both engines. This records
successful baseline capture; the current Visual comparison status is tracked in the
[PR #313 checks](https://github.com/tum-ai/website_new/pull/313/checks).

[Vercel deployment](https://vercel.com/tum-ai/website/7CkixqLL99JTVoNnJ8Rmp1g5Pn6y) of commit `fcbfb8e` compiled
successfully and finished TypeScript checks on 2026-10-03. It then failed during
`/_not-found` prerendering at 19:32:47Z with `ContentError` at
`siteSettings.configuration`: `NEXT_PUBLIC_SANITY_DATASET` must explicitly select a
page-content dataset other than `production`. The logs establish a deployment configuration
failure; they do not establish successful non-mock rendering or CMS readiness. Deployment
environment settings were not changed.

The [asset removal inventory](asset-sources/cms-single-source-cleanup.json) records every deleted
path, byte size, SHA-1 and matching CMS asset ID; [asset notes](asset-sources/cms-single-source-cleanup.md)
record retained migration sources and the proof boundary. The four migration images, official
brand/social/font assets and two generic fixture SVGs remain.

Reproduce the read-only checks with `NEXT_PUBLIC_SANITY_PROJECT_ID=o9uuv2sq` configured
in the environment or `.env.local`:

```sh
pnpm sanity:migrate-single-source --dataset redesign
pnpm sanity:migrate-home-quotes --dataset redesign
pnpm sanity:ready --dataset redesign
pnpm sanity:ready --dataset redesign --plan .sanity-backfill/redesign.single-source-migration.json
pnpm sanity:copy-production --dataset redesign
pnpm sanity:migrate-partners --dataset redesign
pnpm sanity:migrate-org-references --dataset redesign
pnpm sanity:repair-assets --dataset redesign
```

Plans and machine reports are gitignored under `.sanity-backfill/`. Applying a reviewed plan is
a separate maintainer launch action. Preserve pending upload ledgers and migration-source files
until uploads and linking are confirmed. Focused migration retries use
`.sanity-backfill/<dataset>.single-source-assets.json`, a source-path/SHA-256 cache of successful
upload IDs; this is separate from historical `pending-assets.json` repair. Preserve both the
cache and retained source files until the reviewed apply is verified. Timer-stale ISR may retain an older render after an
error; cold, hard-expired and on-demand reads can propagate required-content failures.
