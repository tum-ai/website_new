import { expect, test } from "vitest";
import { getMemberStories } from "@/features/community/server";
import { getTestimonialCards } from "@/features/e-lab/server";
import { homeCopyTemplate } from "./homepage";

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
