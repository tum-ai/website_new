# CMS asset cleanup evidence

On 2026-10-03, 164 redundant local files totaling 10,219,683 bytes were removed. Each file's
SHA-1 matched an image asset in the published `o9uuv2sq/redesign` dataset. The
[removal inventory](cms-single-source-cleanup.json) records the local path, bytes, SHA-1 and
Sanity asset ID. Runtime, test, migration, E2E and showcase callers were checked before deletion;
no pending asset ledger was present in either the implementation or original checkout.

The focused migration still needs four local sources: `partners/hero.webp`,
`events/hosts/atira.svg`, `events/hackathons/ehl-2026-grand-finale-poster.webp`, and
`events/hackathons/makeathon-2023-group.webp`. Those files remain until a separately authorized
migration has linked their assets and pending ledgers are settled. Brand, social image, favicon
and font files remain. Local development and showcase examples use two small generic SVGs in
`assets/fixtures/`.

This inventory proves duplicate bytes and removed local callers. It does not establish that
pending migration uploads or the non-mock deployed site are ready.
