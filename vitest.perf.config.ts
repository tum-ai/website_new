import { defineConfig } from "vitest/config";

/**
 * Build-output assertions (`pnpm test:perf`). They read the production build
 * that `pnpm build` wrote to `.next-prod` and never build on their own, so run
 * `pnpm build` first (`pnpm verify` does both).
 */
export default defineConfig({
  test: {
    name: "perf",
    environment: "node",
    include: ["test/perf/**/*.perf.ts"],
  },
});
