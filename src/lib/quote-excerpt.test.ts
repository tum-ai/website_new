import { expect, test } from "vitest";
import { isExcerptOf, normaliseQuoteText } from "./quote-excerpt";

const story =
  "TUM.ai let me lead a team.  It’s the “make-it-happen” mindset\nthat stuck.";

test("an excerpt is a passage of the story, word for word", () => {
  expect(isExcerptOf("TUM.ai let me lead a team.", story)).toBe(true);
  expect(isExcerptOf("TUM.ai let me lead a big team.", story)).toBe(false);
  expect(isExcerptOf("", story)).toBe(false);
  expect(isExcerptOf("  ", story)).toBe(false);
});

test("typography that doesn't change the words is evened out", () => {
  expect(
    isExcerptOf(`It's the "make-it-happen" mindset that stuck.`, story),
  ).toBe(true);
  expect(isExcerptOf("“TUM.ai let me lead a team.”", story)).toBe(true);
  expect(normaliseQuoteText(" a …\n b ")).toBe("a ... b");
});
