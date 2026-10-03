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

- The literal gate is `if (process.env.USE_MOCK_CMS === "1" && !process.env.VERCEL)`.
  `src/lib/sanity.ts` dynamically loads event/research mocks from `mock-cms.ts`; page readers in
  `cms-content.ts` dynamically load `cms-content-mock.ts`, which evaluates real GROQ with groq-js
  over small synthetic documents in `cms-fixtures/`. The gate is never active on Vercel.
  Fixtures are independent local data, not a production import seed (ADR 0009).
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
- Without the flag, readers use real CMS data. Required page content rejects incomplete data
  or configuration; optional collections can be empty. A flag on `pnpm start` alone does nothing.
- A value without an offset, or an unparsable one, throws instead of falling back to the real
  clock, so a typo fails the run.
- The readers and `getCmsNow()` in `lib/mock-cms-env.ts` read the literal gate so build-time
  inlining folds it. CI Build/perf and Playwright fix `MOCK_CMS_NOW=2026-10-01T12:00:00Z`.
- Fixture type-only imports of domain/config types are allowed for shape checks; runtime imports
  of readers are not. Architecture checks reject static production paths to fixture entrypoints.
- Mock checks prove synthetic query/parser/UI behavior. Real dataset readiness requires the
  separate read-only `sanity:ready --dataset redesign` command.
- Wrapping the inlined value in `JSON.stringify` once produced the string `"1"` with quotes, so
  the gate never matched; `test/next-config.test.ts` guards the raw value.

## Sources

- #262 (What: "Local CMS data"), #267 (Mock CMS; How: build-time inlining fix; positive and
  negative control builds)
- `next.config.ts`, `src/lib/sanity.ts`, `src/lib/mock-cms-env.ts`, `.env.example`
