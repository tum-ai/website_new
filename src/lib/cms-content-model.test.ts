import { describe, expect, test } from "vitest";
import {
  type ContentImage,
  isEmptyContent,
  mergeOverFallback,
  toContentImage,
} from "./cms-content-model";

const image: ContentImage = {
  src: "/assets/logo_new_white_standard.png",
  width: 400,
  height: 200,
  alt: "TUM.ai",
};

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

describe("isEmptyContent", () => {
  test.each([null, undefined, "", "  ", []])("%j is not set", (value) => {
    expect(isEmptyContent(value)).toBe(true);
  });

  test.each([0, false, "x", [1], {}])("%j is set", (value) => {
    expect(isEmptyContent(value)).toBe(false);
  });
});

describe("mergeOverFallback", () => {
  const fallback = {
    title: "Code title",
    count: 3,
    open: true,
    items: ["a", "b"],
    image,
    nested: { lead: "Code lead", note: "Code note" },
  };

  test("returns the fallback when nothing was fetched", () => {
    expect(mergeOverFallback(fallback, null)).toBe(fallback);
    expect(mergeOverFallback(fallback, undefined)).toBe(fallback);
  });

  test("lets set fields win and keeps the fallback for empty ones", () => {
    expect(
      mergeOverFallback(fallback, {
        title: "CMS title",
        count: 0,
        open: false,
        items: [],
        nested: { lead: " ", note: "CMS note" },
      }),
    ).toStrictEqual({
      ...fallback,
      title: "CMS title",
      count: 0,
      open: false,
      nested: { lead: "Code lead", note: "CMS note" },
    });
  });

  test("replaces lists wholesale only when the fetched list has items", () => {
    expect(mergeOverFallback(["a", "b"], ["c"])).toStrictEqual(["c"]);
    expect(mergeOverFallback(["a", "b"], [])).toStrictEqual(["a", "b"]);
    expect(mergeOverFallback(["a"], "not a list")).toStrictEqual(["a"]);
  });

  test("treats images as atomic", () => {
    const uploaded = {
      src: "https://cdn.sanity.io/x.png",
      width: 10,
      height: 5,
      alt: "",
    };
    expect(
      mergeOverFallback(fallback, { image: uploaded }).image,
    ).toStrictEqual(uploaded);
    expect(
      mergeOverFallback(fallback, { image: { src: "", alt: "Only alt" } })
        .image,
    ).toBe(image);
  });

  test("adds set fields the fallback lacks, and skips empty ones", () => {
    const merged = mergeOverFallback<Record<string, unknown>>(
      { title: "Code" },
      { extra: "CMS", empty: null, blank: "" },
    );
    expect(merged).toStrictEqual({ title: "Code", extra: "CMS" });
  });

  test("keeps the fallback when the fetched type does not match", () => {
    expect(mergeOverFallback("text", 42)).toBe("text");
    expect(mergeOverFallback({ a: 1 }, "text")).toStrictEqual({ a: 1 });
    expect(mergeOverFallback(fallback, { nested: "text" }).nested).toBe(
      fallback.nested,
    );
  });

  test("takes any set value where the fallback has none", () => {
    expect(mergeOverFallback<string | undefined>(undefined, "CMS")).toBe("CMS");
    expect(
      mergeOverFallback<{ note?: string }>({}, { note: "CMS" }),
    ).toStrictEqual({ note: "CMS" });
  });
});
