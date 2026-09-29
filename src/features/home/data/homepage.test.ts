import { expect, test } from "vitest";
import { memberStories } from "@/features/community";
import { testimonialCards } from "@/features/e-lab";
import { memberQuote, partnerQuoteId } from "./homepage";

// A mismatch would silently drop the quote from its band.
test("the partner quote is an E-Lab testimonial", () => {
  expect(testimonialCards.map((card) => card.id)).toContain(partnerQuoteId);
});

test("the member quote belongs to a member story", () => {
  expect(memberStories.map((story) => story.name)).toContain(memberQuote.name);
});
