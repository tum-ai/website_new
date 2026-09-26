import { afterEach, expect, test, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
});

async function loadConfig() {
  vi.resetModules();
  return (await import("../next.config.ts")).default;
}

/**
 * next.config.ts inlines USE_MOCK_CMS at build time so a normal build ships
 * no mock-CMS code. Next JSON-encodes define values itself: the config must
 * pass the raw value, or the inlined string carries its own quotes and the
 * `=== "1"` gate in lib/sanity.ts never matches (a mock build then silently
 * serves nothing).
 */
test.each([
  ["1", "1"],
  ["", ""],
])("USE_MOCK_CMS=%j is inlined as the raw value %j", async (value, inlined) => {
  vi.stubEnv("USE_MOCK_CMS", value);
  const config = await loadConfig();
  expect(config.compiler?.defineServer).toStrictEqual({
    "process.env.USE_MOCK_CMS": inlined,
  });
});
