import { afterEach, expect, test, vi } from "vitest";
import { getMemberStories } from "@/features/community/server";
import { getTestimonialCards } from "@/features/e-lab/server";
import { isExcerptOf } from "@/lib/quote-excerpt";
import { homeCopyTemplate } from "./homepage";

afterEach(() => {
  vi.unstubAllEnvs();
});

// A mismatch would silently drop the quote from its band.
test("the partner quote is an E-Lab testimonial", async () => {
  const cards = await getTestimonialCards();
  expect(cards.map((card) => card.id)).toContain(
    homeCopyTemplate.partners.quote,
  );
});

test("every member quote belongs to a member story, each member once", async () => {
  const names = homeCopyTemplate.join.quotes.map((quote) => quote.name);
  const stories = (await getMemberStories()).map((story) => story.name);
  for (const name of names) expect(stories).toContain(name);
  expect(new Set(names).size).toBe(names.length);
});

test.each(["code", "sanity"])(
  "the member quotes stay word for word in the %s stories",
  async (source) => {
    vi.stubEnv("CMS_CONTENT_SOURCE", source);
    vi.stubEnv("USE_MOCK_CMS", "1");
    vi.stubEnv("VERCEL", "");
    const stories = await getMemberStories();
    for (const { name, excerpt } of homeCopyTemplate.join.quotes) {
      const story = stories.find((entry) => entry.name === name);
      expect(story && isExcerptOf(excerpt, story.story), name).toBe(true);
    }
  },
);
