import { fileURLToPath } from "node:url";
import type { AliasOptions } from "vite";

const fromRoot = (path: string) =>
  fileURLToPath(new URL(path, import.meta.url));

/**
 * Module aliases shared by every Vitest config (`vitest.config.ts` and
 * `vitest.perf.config.ts`). They mirror the `paths` in `tsconfig.json` and stub
 * modules that only resolve inside the Next.js bundler.
 */
export const vitestAliases = [
  { find: /^@\//, replacement: `${fromRoot("./src")}/` },
  { find: /^@test\//, replacement: `${fromRoot("./test")}/` },
  // `server-only` throws outside the React Server Components bundler.
  { find: /^server-only$/, replacement: fromRoot("./test/stubs/empty.ts") },
] satisfies AliasOptions;
