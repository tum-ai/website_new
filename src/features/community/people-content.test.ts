import { afterEach, describe, expect, test, vi } from "vitest";
import { memberJourney } from "./data/member-journey";
import { stories } from "./data/member-stories";
import { buildMemberStoriesBackfill, getMemberStories } from "./people-content";

/**
 * Parity for the member stories slice: the `person` documents, read back
 * through the real query under the mock CMS, are exactly the code stories.
 * Crafted query results (`override`) check what the adapter keeps.
 */
const override = vi.hoisted(() => ({ result: undefined as unknown }));

vi.mock("@/lib/cms-content-mock", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/cms-content-mock")>();
  return {
    ...actual,
    evaluateMockQuery: (
      ...args: Parameters<typeof actual.evaluateMockQuery>
    ) =>
      override.result === undefined
        ? actual.evaluateMockQuery(...args)
        : override.result,
  };
});

afterEach(() => {
  vi.unstubAllEnvs();
  override.result = undefined;
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

  test("a portrait keeps the hotspot set in the Studio", async () => {
    useSource("sanity");
    override.result = [
      {
        key: "ada",
        name: "Ada",
        role: "Informatics, TUM",
        context: null,
        quote: null,
        story: "I built it.",
        portrait: {
          src: "https://cdn.sanity.io/ada.webp",
          width: 800,
          height: 1000,
          alt: null,
          hotspot: { x: 0.5, y: 0.2 },
        },
        organization: null,
      },
    ];
    await expect(getMemberStories()).resolves.toStrictEqual([
      {
        key: "ada",
        name: "Ada",
        role: "Informatics, TUM",
        story: "I built it.",
        image: "https://cdn.sanity.io/ada.webp",
        imagePosition: "50% 20%",
      },
    ]);
  });

  test("one document per story, keyed by name", () => {
    expect(buildMemberStoriesBackfill().map(({ _id }) => _id)).toContain(
      "person-member-story-xabier-irizar",
    );
  });
});
