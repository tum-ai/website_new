import { describe, expect, test } from "vitest";
import { formatList, spellCount, spellCountCapitalized } from "./words";

describe("formatList", () => {
  test("joins with commas and a final 'and', without a serial comma", () => {
    expect(formatList(["MIT", "Harvard", "Cambridge"])).toBe(
      "MIT, Harvard and Cambridge",
    );
    expect(formatList(["Anthropic", "Lovable"])).toBe("Anthropic and Lovable");
    expect(formatList(["CDTM"])).toBe("CDTM");
    expect(formatList([])).toBe("");
  });
});

describe("spellCount", () => {
  test("spells out zero to twelve", () => {
    expect(spellCount(0)).toBe("zero");
    expect(spellCount(7)).toBe("seven");
    expect(spellCount(12)).toBe("twelve");
  });

  test("keeps digits above twelve and for non-counts", () => {
    expect(spellCount(13)).toBe("13");
    expect(spellCount(-1)).toBe("-1");
    expect(spellCount(2.5)).toBe("2.5");
  });

  test("capitalizes for the start of a sentence", () => {
    expect(spellCountCapitalized(4)).toBe("Four");
    expect(spellCountCapitalized(20)).toBe("20");
  });
});
