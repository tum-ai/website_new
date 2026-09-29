import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  assetFileOf,
  backfillId,
  backfillImage,
  collectSanityAssets,
  findUnattachedAssets,
  publicDir,
  publicPathOf,
} from "./cms-backfill";

describe("backfillId", () => {
  test("slugs the type and parts into a public document id", () => {
    expect(backfillId("faq", "e-lab", "Can I apply as a solo founder?")).toBe(
      "faq-e-lab-can-i-apply-as-a-solo-founder",
    );
    expect(backfillId("person", "Jürgen Müller", 2)).toBe(
      "person-jurgen-muller-2",
    );
  });

  test("never contains a dot, which would make the document private", () => {
    expect(backfillId("faq", "join TUM.ai")).toBe("faq-join-tum-ai");
  });

  test("caps the length without a trailing hyphen", () => {
    const id = backfillId("faq", "word ".repeat(60));
    expect(id.length).toBeLessThanOrEqual(128);
    expect(id).not.toMatch(/-$/);
  });

  test("needs a type", () => {
    expect(() => backfillId("")).toThrow();
  });
});

describe("backfillImage", () => {
  test("points _sanityAsset at the shipped file and keeps alt", () => {
    const image = backfillImage("/assets/logo_new_white_standard.png", {
      alt: "Logo",
    });
    expect(image).toStrictEqual({
      _type: "image",
      _sanityAsset: `image@file://${join(publicDir, "assets/logo_new_white_standard.png")}`,
      alt: "Logo",
    });
    expect(publicPathOf(assetFileOf(image._sanityAsset) ?? "")).toBe(
      "/assets/logo_new_white_standard.png",
    );
  });

  test("turns objectPosition into a hotspot", () => {
    expect(
      backfillImage("/assets/home_img4.webp", { objectPosition: "50% 30.5%" })
        .hotspot,
    ).toStrictEqual({
      _type: "sanity.imageHotspot",
      x: 0.5,
      y: 0.305,
      width: 1,
      height: 1,
    });
  });

  test("rejects paths outside /assets and keyword positions", () => {
    expect(() => backfillImage("https://example.com/a.png")).toThrow();
    expect(() =>
      backfillImage("/assets/home_img4.webp", { objectPosition: "center top" }),
    ).toThrow(/objectPosition/);
  });
});

test("assetFileOf reads only absolute file assets", () => {
  expect(assetFileOf("image@file:///tmp/a.png")).toBe("/tmp/a.png");
  expect(assetFileOf("image@https://example.com/a.png")).toBeNull();
  expect(assetFileOf("image@file://relative/a.png")).toBeNull();
});

test("collectSanityAssets finds nested assets once", () => {
  const logo = backfillImage("/assets/home_img4.webp")._sanityAsset;
  const photo = backfillImage("/assets/partners_pic.webp")._sanityAsset;
  expect(
    collectSanityAssets([
      { _id: "a", logo: { _sanityAsset: logo } },
      {
        _id: "b",
        people: [
          { photo: { _sanityAsset: photo } },
          { logo: { _sanityAsset: logo } },
        ],
      },
    ]),
  ).toStrictEqual([logo, photo]);
});

describe("findUnattachedAssets", () => {
  const photo = (name: string) => ({
    _type: "image",
    _sanityAsset: `image@file:///assets/${name}.webp`,
    alt: name,
  });
  const planned = {
    _id: "homeCopy",
    _type: "homeCopy",
    hero: photo("hero"),
    people: [
      { _key: "ada", _type: "entry", portrait: photo("ada") },
      { _key: "bo", _type: "entry", portrait: photo("bo") },
    ],
    gallery: [photo("one"), photo("two")],
  };
  const attached = { _type: "image", asset: { _ref: "image-abc-1x1-webp" } };

  test("finds the images the import left without a file", () => {
    const existing = {
      ...planned,
      hero: { _type: "image", alt: "hero" },
      people: [
        { _key: "bo", portrait: attached },
        { _key: "ada", portrait: { _type: "image" } },
      ],
      gallery: [attached, { _type: "image" }],
    };
    expect(findUnattachedAssets(planned, existing)).toStrictEqual([
      { path: "hero", sanityAsset: "image@file:///assets/hero.webp" },
      {
        path: 'people[_key=="ada"].portrait',
        sanityAsset: "image@file:///assets/ada.webp",
      },
      { path: "gallery[1]", sanityAsset: "image@file:///assets/two.webp" },
    ]);
  });

  test("leaves what an editor changed alone", () => {
    const existing = {
      hero: attached,
      // Ada removed and Bo's portrait cleared in the Studio.
      people: [{ _key: "bo" }],
      gallery: "not a list any more",
    };
    expect(findUnattachedAssets(planned, existing)).toStrictEqual([]);
    expect(findUnattachedAssets(planned, undefined)).toStrictEqual([]);
  });
});
