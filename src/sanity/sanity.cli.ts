import { defineCliConfig } from "sanity/cli";

/**
 * Sanity CLI config for schema extraction and TypeGen only (`pnpm
 * sanity:typegen`). The Studio itself is embedded at /studio and built by
 * Next, so this file lives next to `sanity.config.ts`: the CLI treats the
 * folder holding that file as the project root and resolves every path below
 * from here.
 *
 * - The Studio has two workspaces (`live`, `content`) and
 *   `sanity schemas extract` reads one per run, so `pnpm sanity:typegen`
 *   extracts both and `scripts/sanity/merge-schemas.mjs` merges them into
 *   `schema.json`. The extracts are intermediate files in
 *   `node_modules/.cache`, not committed: they are mostly Sanity's built-in
 *   asset types, and the generated TypeScript is what reviewers read.
 * - Queries are found in `lib` (the live dataset's queries and shared
 *   content types), in feature content slices (`features/<x>/content.ts` and
 *   `<topic>-content.ts`)
 *   and in config content slices (`config/<x>-content.ts`).
 * - Required fields (`Rule.required()`) are extracted as non-optional
 *   (`--enforce-required-fields`), so `title`, `name` and `event_date` are
 *   typed `string`, not `string | null`.
 * - The generated types go to `src/lib` because `lib` may import only `lib`
 *   (see src/architecture.test.ts), and `lib/types.ts` re-exports them.
 * - `overloadClientMethods` is off: it augments `@sanity/client`, which is not
 *   a direct dependency (pnpm does not hoist it), so fetches name their result
 *   type explicitly.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "test-project-id",
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  },
  typegen: {
    path: [
      "../lib/**/*.ts",
      "../features/**/*content.ts",
      "../config/*-content.ts",
    ],
    schema: "../../node_modules/.cache/sanity/schema.json",
    generates: "../lib/sanity.types.generated.ts",
    overloadClientMethods: false,
    formatGeneratedCode: false,
  },
});
