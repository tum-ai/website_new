import { defineConfig } from "vitest/config";
import { vitestAliases } from "./vitest.aliases";

/**
 * Build-output assertions (`pnpm test:perf`). They read the production build
 * that `pnpm build` wrote to `.next-prod` and never build on their own, so run
 * `pnpm build` first (`pnpm verify` does both).
 */
export default defineConfig({
  // Not merged with `vitest.config.ts`: its `projects` would replace this
  // config's single perf project.
  resolve: { alias: vitestAliases },
  test: {
    name: "perf",
    environment: "node",
    include: ["test/perf/**/*.perf.ts"],
  },
});
