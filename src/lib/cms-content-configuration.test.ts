import { afterEach, expect, test, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
test.each([
  { project: "bad/project", dataset: "redesign" },
  { project: "test-project-id", dataset: "bad/dataset" },
])(
  "invalid real client configuration imports safely and fails at read",
  async ({ project, dataset }) => {
    vi.stubEnv("NEXT_PUBLIC_SANITY_PROJECT_ID", project);
    vi.stubEnv("NEXT_PUBLIC_SANITY_DATASET", dataset);
    vi.stubEnv("USE_MOCK_CMS", "");
    vi.resetModules();
    const { fetchContent } = await import("./cms-content");
    await expect(
      fetchContent({ query: "*[]", tags: [], label: "settings" }),
    ).rejects.toThrow(/settings.configuration/);
  },
);
