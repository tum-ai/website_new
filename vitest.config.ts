import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

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
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${fromRoot("./src")}/` },
      { find: /^@test\//, replacement: `${fromRoot("./test")}/` },
      // `server-only` throws outside the React Server Components bundler.
      { find: /^server-only$/, replacement: fromRoot("./test/stubs/empty.ts") },
    ],
  },
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
