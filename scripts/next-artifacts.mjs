import { existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

/**
 * Dist dirs that no current script writes. Older tooling (the webpack
 * homepage test, the `next build` typecheck, the old test runner) left them
 * behind; their stale route types would otherwise be type-checked by builds.
 */
export const LEGACY_NEXT_OUTPUT_DIRS = [
  ".next-homepage-perf",
  ".next-test",
  ".next-typecheck",
  ".next-webpack",
];

/**
 * Next.js' default dist dir. Only a bare `next build` (or Vercel) writes it
 * locally; a bare `next dev` writes `.next/dev`.
 */
const DEFAULT_DIST_DIR = ".next";

/** Subdirectories Next.js itself keeps when it cleans a dist dir. */
const KEEP_IN_DEFAULT_DIST_DIR = new Set(["cache", "dev", "lock"]);

/**
 * Removes stale Next.js build output before a production build.
 *
 * Never touches dev-server output (`.next-dev`, `.next/dev`), so a running
 * `pnpm dev` survives `pnpm build`. The isolated dist dir being built is
 * cleaned by `next build` itself.
 *
 * @param {{ root?: string, preserve?: string[] }} [options]
 *   `root`: project directory (default: cwd). `preserve`: dist dirs to keep.
 */
export function clearNextArtifacts({
  root = process.cwd(),
  preserve = [],
} = {}) {
  const preserved = new Set(preserve);

  for (const dir of LEGACY_NEXT_OUTPUT_DIRS) {
    if (!preserved.has(dir)) {
      rmSync(join(root, dir), { recursive: true, force: true });
    }
  }

  const defaultDistDir = join(root, DEFAULT_DIST_DIR);
  if (preserved.has(DEFAULT_DIST_DIR) || !existsSync(defaultDistDir)) {
    return;
  }
  for (const entry of readdirSync(defaultDistDir)) {
    if (!KEEP_IN_DEFAULT_DIST_DIR.has(entry)) {
      rmSync(join(defaultDistDir, entry), { recursive: true, force: true });
    }
  }
}
