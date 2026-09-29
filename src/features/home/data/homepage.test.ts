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

test("the member quote belongs to a member story", async () => {
  const stories = await getMemberStories();
  expect(stories.map((story) => story.name)).toContain(
    homeCopyTemplate.join.quote.name,
  );
});

test.each(["code", "sanity"])(
  "the member quote stays word for word in the %s story",
  async (source) => {
    vi.stubEnv("CMS_CONTENT_SOURCE", source);
    vi.stubEnv("USE_MOCK_CMS", "1");
    vi.stubEnv("VERCEL", "");
    const { name, excerpt } = homeCopyTemplate.join.quote;
    const story = (await getMemberStories()).find(
      (entry) => entry.name === name,
    );
    expect(story && isExcerptOf(excerpt, story.story), name).toBe(true);
  },
);
