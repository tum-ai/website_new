# 0004: Vitest and Playwright

- **Status:** Accepted
- **Date:** 2026-09-26 (W0-A #263, W1-E2E #268); visual job 2026-09-28 (#272)

## Context

Tests ran on Node's built-in runner through `tsx`: 48 cases, mostly lib code. `pnpm test` ran a
full webpack `next build` at import time, which made CI build twice, asserted on webpack output
while production uses Turbopack, deleted a running dev server's `.next-dev` and rewrote
`tsconfig.json`. There were no component, E2E, accessibility or visual tests, and several tests
grepped source files.

## Decision

The cleanup plan decided on Vitest with Testing Library for unit and component tests, and
Playwright with axe for end-to-end, accessibility and visual checks. The plan records the
decision, not a comparison with alternatives.

- **Vitest** (`vitest.config.ts`): a `node` project for `*.test.ts` and a `jsdom` project for
  `*.test.tsx` with Testing Library, jest-dom and an axe matcher. `pnpm test` never builds.
- **Build-output checks** moved to `pnpm test:perf`, which reads the Turbopack output of
  `pnpm build`.
- **Playwright** (`playwright.config.ts`) runs against a production build with the mock CMS, in
  Chromium and WebKit, with projects per viewport, reduced motion and no-JS.
- **Visual baselines** are Linux screenshots captured and compared in the official Playwright
  Docker image, never on a developer machine.

## Consequences

- `pnpm test` dropped from 52 s wall (with a webpack build) to about 3 s, and later grew to
  hundreds of tests colocated with the code.
- `vitest-axe` didn't type-check with Vitest 5, so `test/axe.ts` wraps axe-core with a small
  typed matcher. jsdom can't check contrast, so Playwright's axe run covers it.
- `webkit-iphone` froze on GitHub's Linux runners; CI covers phones with `chromium-phone` and
  keeps the project for local runs.
- Visual baselines can only be updated through CI (the `update-snapshots` label), because the
  capture must match the comparison environment. Screenshots hide photos, video and grain, which
  cut the baselines from 90 MB to 44 MB and removed WebKit photo-decoding flakes.
- CI shards E2E three ways and each shard builds on its own, because a shared build job would sit
  on the critical path (#273).

## Sources

- #263 (Why; deviations: `vitest-axe`), #268 (projects; `webkit-iphone`), #272 (Visual job,
  screenshot style), #273 (sharding)
- Cleanup plan, "Decisions made: Tests"
- [testing.md](../testing.md)
