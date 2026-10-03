import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  assetFileOf,
  backfillId,
  backfillImage,
  collectSanityAssets,
  findUnattachedAssets,
  pendingAssetsBeforeImport,
  plannedAssets,
  publicDir,
  publicPathOf,
  settlePendingAssets,
} from "../scripts/sanity/asset-ledger";

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
      backfillImage("/assets/fixtures/photo.svg", {
        objectPosition: "50% 30.5%",
      }).hotspot,
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
      backfillImage("/assets/fixtures/photo.svg", {
        objectPosition: "center top",
      }),
    ).toThrow(/objectPosition/);
  });
});

test("assetFileOf reads only absolute file assets", () => {
  expect(assetFileOf("image@file:///tmp/a.png")).toBe("/tmp/a.png");
  expect(assetFileOf("image@https://example.com/a.png")).toBeNull();
  expect(assetFileOf("image@file://relative/a.png")).toBeNull();
});

test("collectSanityAssets finds nested assets once", () => {
  const logo = backfillImage("/assets/fixtures/photo.svg")._sanityAsset;
  const photo = backfillImage("/assets/fixtures/logo.svg")._sanityAsset;
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

describe("the pending-assets ledger", () => {
  const photo = (name: string) => ({
    _type: "image",
    _sanityAsset: `image@file:///assets/${name}.webp`,
    alt: name,
  });
  const asset = (name: string) => `image@file:///assets/${name}.webp`;
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
  const heroPaths = [
    { path: "hero", sanityAsset: asset("hero") },
    { path: 'people[_key=="ada"].portrait', sanityAsset: asset("ada") },
    { path: 'people[_key=="bo"].portrait', sanityAsset: asset("bo") },
    { path: "gallery[0]", sanityAsset: asset("one") },
    { path: "gallery[1]", sanityAsset: asset("two") },
  ];
  const attached = { _type: "image", asset: { _ref: "image-abc-1x1-webp" } };
  const pending = (documentId: string, path: string, name: string) => ({
    documentId,
    path,
    sanityAsset: asset(name),
  });

  test("plannedAssets lists every image with its patch path", () => {
    expect(plannedAssets(planned)).toStrictEqual(heroPaths);
    expect(plannedAssets({ _id: "faq", question: "?" })).toStrictEqual([]);
  });

  describe("before the import", () => {
    const person = {
      _id: "person-ada",
      _type: "person",
      portrait: photo("ada"),
    };

    test("adds the images of the documents the import creates", () => {
      expect(
        pendingAssetsBeforeImport([planned, person], {
          existingIds: new Set(["homeCopy"]),
          previous: [],
          overwrite: false,
        }),
      ).toStrictEqual([pending("person-ada", "portrait", "ada")]);
    });

    test("adds every image with --overwrite, which recreates every document", () => {
      expect(
        pendingAssetsBeforeImport([planned, person], {
          existingIds: new Set(["homeCopy", "person-ada"]),
          previous: [],
          overwrite: true,
        }),
      ).toStrictEqual([
        ...heroPaths.map((entry) => ({ documentId: "homeCopy", ...entry })),
        pending("person-ada", "portrait", "ada"),
      ]);
    });

    test("keeps the unconfirmed entries, once each, with the planned file", () => {
      const previous = [
        pending("homeCopy", "hero", "old-hero"),
        pending("person-gone", "portrait", "gone"),
      ];
      expect(
        pendingAssetsBeforeImport([planned, person], {
          existingIds: new Set(["homeCopy"]),
          previous,
          overwrite: false,
        }),
      ).toStrictEqual([
        pending("homeCopy", "hero", "hero"),
        pending("person-gone", "portrait", "gone"),
        pending("person-ada", "portrait", "ada"),
      ]);
    });
  });

  describe("after the import", () => {
    const entries = [
      pending("homeCopy", "hero", "hero"),
      pending("homeCopy", 'people[_key=="ada"].portrait', "ada"),
      pending("homeCopy", "gallery[1]", "two"),
    ];

    test("repairs the entries whose image has no file, on the document and its draft", () => {
      const published = {
        _id: "homeCopy",
        hero: { _type: "image", alt: "hero" },
        people: [
          { _key: "bo", portrait: attached },
          { _key: "ada", portrait: { _type: "image" } },
        ],
        gallery: [attached, attached],
      };
      const draft = {
        _id: "drafts.homeCopy",
        hero: attached,
        people: [{ _key: "ada", portrait: { _type: "image" } }],
      };
      expect(findUnattachedAssets(entries, [published, draft])).toStrictEqual({
        open: entries.slice(0, 2),
        repairs: [
          { document: published, assets: entries.slice(0, 2) },
          { document: draft, assets: [entries[1]] },
        ],
      });
    });

    test("leaves an image an editor removed alone: it is not in the ledger", () => {
      // The Studio's Remove keeps alt: only the ledger tells the two apart.
      const removed = { _type: "image", alt: "hero" };
      const stored = [
        { _id: "homeCopy", hero: removed },
        { _id: "drafts.homeCopy", hero: removed },
      ];
      expect(findUnattachedAssets([], stored)).toStrictEqual({
        open: [],
        repairs: [],
      });
      const other = [pending("homeCopy", "gallery[0]", "one")];
      expect(findUnattachedAssets(other, stored).repairs).toStrictEqual([]);
    });

    test("settles entries that have their file or are gone", () => {
      const stored = [
        {
          _id: "homeCopy",
          hero: attached,
          people: [{ _key: "bo", portrait: attached }],
          gallery: "not a list any more",
        },
        // A draft without the file does not reopen an entry.
        { _id: "drafts.homeCopy", hero: { _type: "image" } },
      ];
      expect(findUnattachedAssets(entries, stored)).toStrictEqual({
        open: [],
        repairs: [],
      });
      expect(findUnattachedAssets(entries, [])).toStrictEqual({
        open: [],
        repairs: [],
      });
    });

    test("keeps the open entries of a document whose repair failed", () => {
      const open = [
        pending("homeCopy", "hero", "hero"),
        pending("person-ada", "portrait", "ada"),
        pending("person-bo", "portrait", "bo"),
      ];
      expect(
        settlePendingAssets(
          open,
          new Set(["homeCopy", "drafts.homeCopy", "drafts.person-bo"]),
        ),
      ).toStrictEqual([open[0], { ...open[2], draftOnly: true }]);
      expect(settlePendingAssets(open, new Set())).toStrictEqual([]);
    });

    test("a draft-only entry repairs the draft while it lacks the file", () => {
      const entry = {
        ...pending("homeCopy", "hero", "hero"),
        draftOnly: true as const,
      };
      const published = { _id: "homeCopy", hero: attached };
      const draft = { _id: "drafts.homeCopy", hero: { _type: "image" } };
      expect(findUnattachedAssets([entry], [published, draft])).toStrictEqual({
        open: [entry],
        repairs: [{ document: draft, assets: [entry] }],
      });
      // Settled once the draft has its file, or is gone (published or deleted).
      const repaired = { ...draft, hero: attached };
      for (const stored of [[published, repaired], [published]]) {
        expect(findUnattachedAssets([entry], stored)).toStrictEqual({
          open: [],
          repairs: [],
        });
      }
    });
  });
});
