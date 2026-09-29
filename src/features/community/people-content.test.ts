import { afterEach, describe, expect, test, vi } from "vitest";
import { memberJourney } from "./data/member-journey";
import { stories } from "./data/member-stories";
import { buildMemberStoriesBackfill, getMemberStories } from "./people-content";

/**
 * Parity for the member stories slice: the `person` documents, read back
 * through the real query under the mock CMS, are exactly the code stories.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

describe("the member stories slice", () => {
  test("code source: the code stories", async () => {
    useSource("code");
    await expect(getMemberStories()).resolves.toStrictEqual(stories);
  });

  test("sanity source over the backfill: the same stories", async () => {
    useSource("sanity");
    await expect(getMemberStories()).resolves.toStrictEqual(stories);
  });

  test("the journey's excerpts stay word for word in the CMS stories", async () => {
    useSource("sanity");
    const cms = await getMemberStories();
    const evidence = memberJourney
      .flatMap((stage) =>
        stage.kind === "single" ? [stage.step] : stage.steps,
      )
      .flatMap(({ evidence }) => (evidence ? [evidence] : []));
    expect(evidence.length).toBeGreaterThan(0);
    for (const { name, excerpt } of evidence) {
      const story = cms.find((entry) => entry.name === name);
      expect(story?.story, name).toContain(excerpt);
    }
  });

  test("one document per story, keyed by name", () => {
    expect(buildMemberStoriesBackfill().map(({ _id }) => _id)).toContain(
      "person-member-story-xabier-irizar",
    );
  });
});
