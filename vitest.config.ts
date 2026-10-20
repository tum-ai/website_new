import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { vitestAliases } from "./vitest.aliases";

/**
 * Unit and component tests. `pnpm test` never builds the app; the
 * build-output assertions live in `vitest.perf.config.ts` (`pnpm test:perf`).
 *
 * - `node`: `*.test.ts` (pure logic, config, content facts).
 * - `jsdom`: `*.test.tsx` (React components with Testing Library, jest-dom
 *   and axe matchers from `vitest.setup.ts`).
 *
 * Tests may live next to the code under `src/` or in `test/`.
 */
export default defineConfig({
  resolve: { alias: vitestAliases },
  test: {
    exclude: ["**/node_modules/**", "**/.next*/**", "e2e/**"],
    server: {
      deps: {
        // Imports `next/*` without file extensions, which Node's ESM resolver
        // rejects (`next` has no exports map); let Vite resolve them.
        inline: ["next-sanity", "@tum.ai/ui-kit"],
      },
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/sanity/**", "src/app/studio/**"],
      reporter: ["text-summary", "html", "json-summary"],
      reportsDirectory: "coverage",
      // Application logic keeps its existing coverage gates. Primitive coverage
      // belongs to the published UI kit; website adapters are integration-tested.
      thresholds: {
        "src/lib/**": { lines: 90 },
        "src/features/**/*.ts": { lines: 90 },
      },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.ts", "test/**/*.test.ts"],
        },
      },
      {
        extends: true,
        plugins: [react()],
        test: {
          name: "jsdom",
          environment: "jsdom",
          include: ["src/**/*.test.tsx", "test/**/*.test.tsx"],
          setupFiles: ["./vitest.setup.ts"],
        },
      },
    ],
  },
});
