import { describe, expect, test } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { impactFacts } from "@/config/impact";
import { fillCodeCopy } from "@/lib/content-copy";
import {
  getAbstractBody as bodyOf,
  researchCopyTemplate,
  researchPageTokens,
} from "./research-copy";

const { abstract } = fillCodeCopy(
  researchCopyTemplate,
  contentTokens,
  researchPageTokens,
);
const getAbstractBody = (
  count: number,
  copy: Parameters<typeof bodyOf>[1] = abstract,
) => bodyOf(count, copy);

describe("getAbstractBody", () => {
  test("names one running project in the singular", () => {
    expect(getAbstractBody(1)).toContain("One project is running now,");
  });

  test("counts several running projects in digits", () => {
    expect(getAbstractBody(4)).toContain("4 projects are running now,");
  });

  test("quotes the publication count from the impact facts", () => {
    expect(getAbstractBody(3)).toContain(
      `published ${impactFacts.publications}+ papers`,
    );
  });
});

test("the running sentence and body come from the copy passed in", () => {
  expect(
    getAbstractBody(2, {
      label: "",
      statement: "",
      body: "Now: {{running}}.",
      runningOne: "one",
      runningMany: "{{count}} teams",
    }),
  ).toBe("Now: 2 teams.");
});
