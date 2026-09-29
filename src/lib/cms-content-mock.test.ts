import { globSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import { backfillImage, publicDir } from "./cms-backfill";
import {
  evaluateMockQuery,
  readImageSize,
  toMockDataset,
} from "./cms-content-mock";
import { CONTENT_IMAGE_PROJECTION, toContentImage } from "./cms-content-model";

describe("readImageSize", () => {
  test("reads every shipped image format", () => {
    const files = globSync(`${publicDir}/assets/**/*.{png,jpg,jpeg,webp,svg}`);
    expect(files.length).toBeGreaterThan(50);
    for (const file of files) {
      const { width, height } = readImageSize(file);
      expect(Number.isInteger(width) && width > 0, file).toBe(true);
      expect(Number.isInteger(height) && height > 0, file).toBe(true);
    }
  });

  // Reference sizes as reported by `file` and `sips`.
  test.each([
    ["assets/logo_new_white_standard.png", 1112, 280],
    ["assets/innovation/women_at_tumai.jpg", 2430, 1620],
    ["assets/e-lab/testimonials/viktor_shen.jpeg", 467, 467],
    ["assets/home_img4.webp", 1920, 1080],
    ["assets/partners/marquee/nvidia.webp", 400, 311],
  ])("%s is %ix%i", (file, width, height) => {
    expect(readImageSize(join(publicDir, file))).toStrictEqual({
      width,
      height,
    });
  });

  test("SVG: width and height, else the viewBox, single or double quotes", () => {
    const dir = mkdtempSync(join(tmpdir(), "svg-size-"));
    const svg = (name: string, root: string) => {
      const file = join(dir, name);
      writeFileSync(file, `${root}<path d="M0 0"/></svg>`);
      return file;
    };
    expect(
      readImageSize(
        svg("a.svg", '<svg width="120.4px" height="40" viewBox="0 0 1 1">'),
      ),
    ).toStrictEqual({ width: 120, height: 40 });
    expect(
      readImageSize(
        svg("b.svg", "<svg xmlns='x' viewBox='0 0 959.94 236.81'>"),
      ),
    ).toStrictEqual({ width: 960, height: 237 });
    expect(() => readImageSize(svg("c.svg", "<svg>"))).toThrow(/image size/);
  });

  test.each([
    ["a.gif", "GIF89a"],
    ["b.jpg", "\xff\xd8\xff\xe0\x00\x10JFIF-without-a-frame-header"],
    ["c.webp", "RIFF\x00\x00\x00\x00WEBPALPH\x00\x00\x00\x00\x00\x00\x00\x00"],
  ])("throws for a file it cannot size (%s)", (name, content) => {
    const file = join(mkdtempSync(join(tmpdir(), "image-size-")), name);
    writeFileSync(file, Buffer.from(content, "latin1"));
    expect(() => readImageSize(file)).toThrow(/image size/);
  });
});

describe("the mock content dataset", () => {
  const logo = "/assets/logo_new_white_standard.png";
  const documents = [
    {
      _id: "org-a",
      _type: "organization",
      name: "A",
      logo: backfillImage(logo, { alt: "A logo", objectPosition: "50% 25%" }),
    },
    {
      _id: "org-b",
      _type: "organization",
      name: "B",
      logo: backfillImage(logo),
    },
  ];

  test("replaces _sanityAsset with a reference to one shared asset document", () => {
    const dataset = toMockDataset(documents) as Record<string, unknown>[];
    const assets = dataset.filter((doc) => doc._type === "sanity.imageAsset");
    expect(assets).toHaveLength(1);
    expect(assets[0]).toMatchObject({
      url: logo,
      metadata: { dimensions: { width: 1112, height: 280 } },
    });
    expect(dataset[0].logo).toStrictEqual({
      _type: "image",
      alt: "A logo",
      hotspot: {
        _type: "sanity.imageHotspot",
        x: 0.5,
        y: 0.25,
        width: 1,
        height: 1,
      },
      asset: { _type: "reference", _ref: assets[0]._id },
    });
  });

  test("the image projection resolves to the same /assets file and size as code", async () => {
    const result = await evaluateMockQuery<
      { name: string; logo: Parameters<typeof toContentImage>[0] }[]
    >(
      `*[_type == "organization"] | order(name asc){ name, "logo": logo${CONTENT_IMAGE_PROJECTION} }`,
      {},
      documents,
    );
    expect(result.map(({ logo }) => toContentImage(logo))).toStrictEqual([
      {
        src: logo,
        width: 1112,
        height: 280,
        alt: "A logo",
        objectPosition: "50% 25%",
      },
      { src: logo, width: 1112, height: 280, alt: "" },
    ]);
  });

  test("passes query parameters", async () => {
    const result = await evaluateMockQuery<string[]>(
      `*[_type == "organization" && name == $name].name`,
      { name: "B" },
      documents,
    );
    expect(result).toStrictEqual(["B"]);
  });

  test("rejects a remote _sanityAsset", () => {
    expect(() =>
      toMockDataset([
        {
          _id: "x",
          _type: "t",
          image: { _sanityAsset: "image@https://example.com/a.png" },
        },
      ]),
    ).toThrow(/Unsupported/);
  });
});
