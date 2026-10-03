# CMS single-source rollout evidence

Read-only checks on 2026-10-03 used published `o9uuv2sq/redesign` documents through the direct
API. No CMS mutations, uploads or migration apply were performed.

| Check | Verified result |
|---|---|
| Live runtime readiness (2026-10-03T19:30:02.960Z) | 14/28 registered getters pass. The other 14 fail visibly, primarily through missing `siteSettings.organization.startedApplicationsPerBatch`; E-Lab voice references are also absent. |
| Proposed migration projection (2026-10-03T19:30:00.795Z) | 28/28 real getter/parser checks pass using the same GROQ over live documents plus proposed patches in memory. |
| Focused migration dry run | 3 creates, 21 guarded fill steps, 0 blocked published prerequisites; draft visibility is **unknown**. |
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

The projection simulates planned image assets from retained files' measured dimensions. It
proves query/parser compatibility only. It does **not** prove asset uploads, CDN delivery, live
CMS readiness, a real deployed preview, or fixture exclusion from an inspected production
bundle. Public preflight cannot inspect drafts: both fresh reports and the plan explicitly
record that boundary as unknown. An available `SANITY_API_READ_TOKEN` enables authenticated
raw draft preflight; future apply also reads raw drafts and guards their revisions. Those
remain separate rollout checks after the maintainer authorizes migration apply.

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
