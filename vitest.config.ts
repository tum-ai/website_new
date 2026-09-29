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
        inline: ["next-sanity"],
      },
    },
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/sanity/**", "src/app/studio/**"],
      reporter: ["text-summary", "html", "json-summary"],
      reportsDirectory: "coverage",
      // Line coverage per group, enforced by `pnpm test:coverage` (CI's Unit
      // job). Logic is held to 90 %; ds components to 80 %, because their
      // motion branches (Parallax, CountUp, Timeline scroll markers) only run
      // in a real browser, where E2E and visual cover them. Measured at the
      // time of adding: lib 99 %, features/**/*.ts 93 %, ds 90 %.
      thresholds: {
        "src/lib/**": { lines: 90 },
        "src/features/**/*.ts": { lines: 90 },
        "src/components/ds/**": { lines: 80 },
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
