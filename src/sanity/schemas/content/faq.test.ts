import { expect, test } from "vitest";
import { reservedQandaIds } from "@/lib/page-anchors";
import { anchorProblem } from "./faq";

test("a Q&A anchor must be set, well formed and not one the page uses", () => {
  expect(anchorProblem("member-journey", "qanda")).toBe(true);
  expect(anchorProblem(undefined, "apply")).toBe(true);
  expect(anchorProblem("", "qanda")).toMatch(/needs an anchor/);
  expect(anchorProblem("Member Journey", "qanda")).toMatch(/lowercase/);
  for (const id of reservedQandaIds) {
    expect(anchorProblem(id, "qanda"), id).toMatch(/page itself/);
  }
});
