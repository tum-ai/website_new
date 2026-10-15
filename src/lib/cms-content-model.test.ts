import { describe, expect, test } from "vitest";
import {
  contentArray,
  contentObject,
  contentOptional,
  contentString,
  contentText,
  parseContent,
  toContentImage,
} from "./cms-content-model";

describe("toContentImage", () => {
  test("maps a projected asset and turns the hotspot into objectPosition", () => {
    expect(
      toContentImage({
        src: "https://cdn.sanity.io/images/x/y/a.png",
        width: 800,
        height: 600,
        alt: "A photo",
        hotspot: { x: 0.5, y: 0.305 },
      }),
    ).toStrictEqual({
      src: "https://cdn.sanity.io/images/x/y/a.png",
      width: 800,
      height: 600,
      alt: "A photo",
      objectPosition: "50% 30.5%",
    });
  });

  test("applies the Studio crop through the CDN, the hotspot within it", () => {
    expect(
      toContentImage({
        src: "https://cdn.sanity.io/images/x/y/a.png",
        width: 1000,
        height: 500,
        alt: "A photo",
        hotspot: { x: 0.5, y: 0.5 },
        crop: { top: 0.1, bottom: 0.1, left: 0.25, right: 0.25 },
      }),
    ).toStrictEqual({
      src: "https://cdn.sanity.io/images/x/y/a.png?rect=250,50,500,400",
      width: 500,
      height: 400,
      alt: "A photo",
      objectPosition: "50% 50%",
    });
    // A hotspot left of the crop pins to its edge.
    expect(
      toContentImage({
        src: "https://cdn.sanity.io/images/x/y/a.png",
        width: 1000,
        height: 500,
        hotspot: { x: 0.1, y: 0.3 },
        crop: { top: 0, bottom: 0, left: 0.25, right: 0 },
      })?.objectPosition,
    ).toBe("0% 30%");
  });

  test("an empty crop leaves the URL and size alone", () => {
    const image = {
      src: "https://cdn.sanity.io/images/x/y/a.png",
      width: 10,
      height: 10,
      crop: { top: 0, bottom: 0, left: 0, right: 0 },
    };
    expect(toContentImage(image)).toStrictEqual({
      src: image.src,
      width: 10,
      height: 10,
      alt: "",
    });
  });

  test("defaults alt to decorative and leaves out a missing hotspot", () => {
    expect(
      toContentImage({ src: "/a.png", width: 1, height: 2, alt: null }),
    ).toStrictEqual({ src: "/a.png", width: 1, height: 2, alt: "" });
  });

  test.each([
    null,
    undefined,
    { src: null, width: 1, height: 1 },
    { src: "/a.png", width: null, height: 1 },
    { src: "/a.png", width: 1, height: 0 },
  ])("is undefined for an empty or incomplete image (%j)", (projected) => {
    expect(toContentImage(projected)).toBeUndefined();
  });
});

test("explicit descriptors reject required fields and retain optional blanks", () => {
  const parser = contentObject({
    title: contentString,
    note: contentOptional(contentText),
    items: contentArray(contentString),
  });
  expect(
    parseContent({ title: "CMS", note: "", items: [] }, parser, "copy"),
  ).toEqual({ title: "CMS", note: "", items: [] });
  expect(() => parseContent({ title: "", items: [] }, parser, "copy")).toThrow(
    /copy.title/,
  );
  expect(() =>
    parseContent({ title: "CMS", items: [null] }, parser, "copy"),
  ).toThrow(/items\[0\]/);
});
