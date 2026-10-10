import { afterEach, describe, expect, test, vi } from "vitest";
import {
  fillCmsCopy,
  fillCodeCopy,
  fillPageTokens,
  splitAtPageToken,
} from "./content-copy";
import { type ContentTokens, contentTokenNames } from "./content-tokens";

const tokens = Object.fromEntries(
  contentTokenNames.map((name) => [name, `<${name}>`]),
) as ContentTokens;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("fillCodeCopy", () => {
  test("fills every string, deeply, and keeps the shape", () => {
    const copy = {
      title: "Since {{org.foundingYear}}",
      items: [{ text: "{{org.majors}} majors", count: 3 }],
      flag: true,
    };
    expect(fillCodeCopy(copy, tokens)).toStrictEqual({
      title: "Since <org.foundingYear>",
      items: [{ text: "<org.majors> majors", count: 3 }],
      flag: true,
    });
  });

  test("throws on an unknown placeholder", () => {
    expect(() => fillCodeCopy({ title: "{{nope}}" }, tokens)).toThrow(/nope/);
  });
});

describe("fillCmsCopy", () => {
  test("preserves intentionally blank fields and empty arrays", () => {
    expect(
      fillCmsCopy(
        { title: "{{org.majors}}", note: "", items: [], nothing: null },
        tokens,
        "copy",
      ),
    ).toEqual({ title: "<org.majors>", note: "", items: [], nothing: null });
  });
  test("unknown placeholders fail with the field path", () => {
    expect(() =>
      fillCmsCopy({ items: [{ title: "{{nope}}" }] }, tokens, "copy"),
    ).toThrow(/copy.items\[0\].title/);
  });
  test("malformed present images fail, even in optional fields", () => {
    expect(() =>
      fillCmsCopy(
        { photo: { src: null, width: null, height: null, hotspot: null } },
        tokens,
        "copy",
      ),
    ).toThrow(/photo/);
  });
  test("valid images convert crop and hotspot", () => {
    expect(
      fillCmsCopy(
        {
          src: "https://example.org/image",
          width: 20,
          height: 10,
          alt: "",
          hotspot: { x: 0.5, y: 0.25 },
        },
        tokens,
        "photo",
      ),
    ).toMatchObject({ objectPosition: "50% 25%", alt: "" });
  });
  test("declared page tokens stay available for rendering", () => {
    expect(
      fillCmsCopy("{{ count }} from {{org.majors}}", tokens, "copy", ["count"]),
    ).toBe("{{ count }} from <org.majors>");
    expect(fillPageTokens("{{count}} teams", { count: "3" })).toBe("3 teams");
  });
});
describe("splitAtPageToken", () => {
  test("splits around the token, with or without spaces in the braces", () => {
    expect(
      splitAtPageToken("Try {{format}}, then {{ format }}.", "format"),
    ).toStrictEqual(["Try ", ", then ", "."]);
  });

  test("leaves other placeholders and token-free text whole", () => {
    expect(splitAtPageToken("{{count}} teams", "format")).toStrictEqual([
      "{{count}} teams",
    ]);
  });
});
