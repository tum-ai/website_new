import { defineConfig } from "@playwright/test";

/**
 * End-to-end, accessibility and visual tests (`pnpm test:e2e`). Specs live in
 * `e2e/`; unit and component tests run in Vitest (`vitest.config.ts`).
 */
export default defineConfig({
  testDir: "e2e",
});
