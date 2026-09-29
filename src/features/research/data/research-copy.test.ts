import { describe, expect, test } from "vitest";
import { impactFacts } from "@/config/impact";
import { getAbstractBody } from "./research-copy";

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
