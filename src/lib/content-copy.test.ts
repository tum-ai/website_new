import { afterEach, describe, expect, test, vi } from "vitest";
import { fillCmsCopy, fillCodeCopy, fillPageTokens } from "./content-copy";
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
  test("fills strings and leaves out unset values", () => {
    expect(
      fillCmsCopy(
        {
          title: "Since {{org.foundingYear}}",
          lead: null,
          blank: "  ",
          list: [],
          group: { a: null },
          items: [{ text: "x", note: null }, null],
          count: 0,
        },
        tokens,
        "test",
      ),
    ).toStrictEqual({
      title: "Since <org.foundingYear>",
      items: [{ text: "x" }],
      count: 0,
    });
  });

  test("an unknown placeholder drops the field, or the list item that holds it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(
      fillCmsCopy(
        {
          title: "{{nope}}",
          group: { lead: "{{nope}}", kept: "ok" },
          items: [{ text: "{{nope}}" }, { text: "fine" }],
        },
        tokens,
        "test",
      ),
    ).toStrictEqual({ group: { kept: "ok" }, items: [{ text: "fine" }] });
    expect(warn).toHaveBeenCalledTimes(3);
  });

  test("turns projected images into content images", () => {
    expect(
      fillCmsCopy(
        {
          photo: {
            src: "https://cdn/x.jpg",
            width: 10,
            height: 20,
            alt: "A room",
            hotspot: { x: 0.5, y: 0.25 },
          },
          empty: { src: null, width: null, height: null, hotspot: null },
          gallery: [
            { src: "https://cdn/y.jpg", width: 1, height: 1, hotspot: null },
          ],
        },
        tokens,
        "test",
      ),
    ).toStrictEqual({
      photo: {
        src: "https://cdn/x.jpg",
        width: 10,
        height: 20,
        alt: "A room",
        objectPosition: "50% 25%",
      },
      gallery: [{ src: "https://cdn/y.jpg", width: 1, height: 1, alt: "" }],
    });
  });

  test("an empty or broken result is null, so the fallback shows", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(fillCmsCopy(null, tokens, "test")).toBeNull();
    expect(fillCmsCopy({ a: null }, tokens, "test")).toBeNull();
    expect(fillCmsCopy("{{nope}}", tokens, "test")).toBeNull();
    expect(fillCmsCopy(["{{nope}}", "a"], tokens, "test")).toStrictEqual(["a"]);
  });
});

describe("page tokens", () => {
  test("filling leaves the kept names for the page, and rejects others", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(
      fillCodeCopy("{{count}} since {{org.foundingYear}}", tokens, ["count"]),
    ).toBe("{{count}} since <org.foundingYear>");
    expect(() => fillCodeCopy("{{count}}", tokens)).toThrow(/count/);
    expect(
      fillCmsCopy(
        { lead: "{{count}} teams", title: "{{other}}" },
        tokens,
        "test",
        ["count"],
      ),
    ).toStrictEqual({ lead: "{{count}} teams" });
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("other"));
  });

  test("the page fills its own tokens and nothing else", () => {
    expect(
      fillPageTokens("{{count}} teams, {{partner}}, {{other}}", {
        count: "Five",
        partner: "Helmholtz",
      }),
    ).toBe("Five teams, Helmholtz, {{other}}");
  });
});
