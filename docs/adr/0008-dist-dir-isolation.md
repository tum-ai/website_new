# 0008: Separate Next.js dist dirs

- **Status:** Accepted
- **Date:** 2026-04-10 (Next.js migration, #158); fixed 2026-09-26 (W0-A, #263)

## Context

`next dev` and `next build` both write to `.next` by default. Running a build (or a build-based
typecheck or test) while the dev server runs overwrote or deleted the dev server's output. The
README of the time put it as keeping `dev`, `build` and `typecheck` from fighting over `.next`.

## Decision

- `pnpm dev` sets `NEXT_DIST_DIR=.next-dev`. `pnpm build`, `pnpm start` and `pnpm typecheck` go
  through `scripts/run-next-command.mjs` with `.next-prod`. `next.config.ts` passes
  `NEXT_DIST_DIR` to `distDir`.
- On Vercel (`VERCEL` set) the helper leaves `NEXT_DIST_DIR` unset, so the platform uses its
  default output.
- Before a build, `scripts/next-artifacts.mjs` removes legacy dist dirs and stale default `.next`
  output, but never `.next-dev` or `.next/dev`, and keeps `.next/cache` (Vercel's restored build
  cache).
- `tsconfig.json` excludes the dev-server output (`.next-dev`, `.next/dev`) instead of deleting
  it, so `pnpm build` and `pnpm typecheck` validate only their own freshly generated route types
  and a stale dev session can't break them.

## Consequences

- `pnpm build` can run while `pnpm dev` is serving; the Playwright web server builds into
  `.next-prod` without disturbing a dev session.
- A bare `next build` or `next dev` writes `.next` and bypasses all of this; use the package
  scripts.
- `test:perf` reads `.next-prod` (or `NEXT_DIST_DIR`), so it needs `pnpm build` first.
- The first version of the cleanup helper deleted a running dev server's output and wiped
  Vercel's build cache, and a test rewrote `tsconfig.json`; #263 fixed all three and
  `test/workspace-scripts.test.ts` checks the invariants.

## Sources

- #158 (scripts introduced), #263 (How: "Dist dirs")
- `scripts/run-next-command.mjs`, `scripts/next-artifacts.mjs`, `test/workspace-scripts.test.ts`
