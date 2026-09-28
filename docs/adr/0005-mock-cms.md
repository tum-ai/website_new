# 0005: A build-time mock CMS with a fixed clock

- **Status:** Accepted
- **Date:** 2026-09-25 (introduced in #262); hardened 2026-09-26 (W1-Data, #267)

## Context

Events, research projects and partners come from Sanity. Working on those pages, and running E2E
and visual tests, needs data without Sanity credentials, and the data must be the same on every
run. Two problems showed up in the first version: the fixtures, which contained the real E-Lab
form and sign-up links, were bundled into the production server; and event dates were relative to
the real clock, so the upcoming/past split changed from day to day.

## Decision

- `USE_MOCK_CMS=1` makes the fetch layer (`src/lib/sanity.ts`) serve fixtures from
  `src/lib/mock-cms.ts` instead of Sanity. The gate is `USE_MOCK_CMS === "1" && !VERCEL`, so it is
  never active on Vercel.
- The flag is read at **build** time: `next.config.ts` inlines it into server code
  (`compiler.defineServer`), and the fixtures are loaded with a dynamic `import()` behind the
  gate. A build without the flag contains no fixture code at all. Set it for `pnpm build` and
  `pnpm dev`, not only for `pnpm start`.
- `MOCK_CMS_NOW` (ISO 8601 date, or date-time with an offset) fixes the "now" the fixtures are
  dated from. The `/events` and `/apply` routes use the same clock for their render date, and the
  visual spec pins the browser clock to it, so server and client agree.
- Fixtures follow the query projections exactly, use `example.com` links and shipped assets, and
  contain no personal data.

## Consequences

- CMS pages can be developed and tested without credentials; E2E and visual runs are
  deterministic.
- Forgetting the flag at build time silently serves real (or empty) CMS data; the flag on
  `pnpm start` alone does nothing.
- A value without an offset, or an unparsable one, throws instead of falling back to the real
  clock, so a typo fails the run.
- The gate is repeated in the two routes that need a render clock (`getRenderNow()`); the
  cleanup's lock-in stream plans to move it into `lib`.
- Wrapping the inlined value in `JSON.stringify` once produced the string `"1"` with quotes, so
  the gate never matched; `test/next-config.test.ts` guards the raw value.

## Sources

- #262 (What: "Local CMS data"), #267 (Mock CMS; How: build-time inlining fix; positive and
  negative control builds)
- `next.config.ts`, `src/lib/sanity.ts`, `src/lib/mock-cms-env.ts`, `.env.example`
