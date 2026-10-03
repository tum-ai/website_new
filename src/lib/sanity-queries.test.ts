import { evaluate, parse } from "groq-js";
import { describe, expect, test } from "vitest";
import {
  EVENTS_QUERY,
  PUBLIC_EVENTS_QUERY,
  PUBLIC_PARTNER_ORGANIZATIONS_QUERY,
  PUBLIC_PARTNERS_QUERY,
  PUBLIC_RESEARCH_QUERY,
  RESEARCH_QUERY,
} from "@/lib/sanity-queries";

async function run(query: string, dataset: unknown[]) {
  const value = await evaluate(parse(query), { dataset });
  return value.get();
}

type TestEvent = {
  id: string;
  images?: string[];
  description?: string;
};

test("event query: images compacts poster+img, drops missing, description falls back", async () => {
  const dataset = [
    { _id: "asset-poster", url: "https://cdn/poster.png" },
    { _id: "asset-img", url: "https://cdn/img.png" },
    {
      _id: "evt-both",
      _type: "event",
      title: "Hackathon",
      desc: "A hackathon",
      event_date: "2026-01-01",
      poster: { asset: { _type: "reference", _ref: "asset-poster" } },
      img: { asset: { _type: "reference", _ref: "asset-img" } },
    },
    {
      _id: "evt-poster-only",
      _type: "event",
      title: "Talk",
      event_date: "2026-02-01",
      poster: { asset: { _type: "reference", _ref: "asset-poster" } },
    },
  ];

  const result = (await run(EVENTS_QUERY, dataset)) as TestEvent[];
  const byId = Object.fromEntries(result.map((e) => [e.id, e]));

  expect(byId["evt-both"].images).toStrictEqual([
    "https://cdn/poster.png",
    "https://cdn/img.png",
  ]);
  expect(byId["evt-poster-only"].images).toStrictEqual([
    "https://cdn/poster.png",
  ]);
  expect(byId["evt-poster-only"].description).toBe("");
  expect(byId["evt-both"].id).toBe("evt-both");
});

test("event query: hosts stay an array and default to empty", async () => {
  const [hosted, bare] = await run(EVENTS_QUERY, [
    {
      _id: "hosted",
      _type: "event",
      title: "Anthropic x Lovable",
      event_date: "2026-01-01",
      hosts: ["Anthropic", "Lovable"],
    },
    { _id: "bare", _type: "event", title: "Talk", event_date: "2026-02-01" },
  ]);
  expect(hosted.hosts).toStrictEqual(["Anthropic", "Lovable"]);
  expect(bare.hosts).toStrictEqual([]);
});

test("event query: end_date passes through, null when unset", async () => {
  const [ranged, single] = await run(EVENTS_QUERY, [
    {
      _id: "ranged",
      _type: "event",
      title: "Makeathon",
      event_date: "2026-04-17T00:00:00.000Z",
      end_date: "2026-04-19T00:00:00.000Z",
    },
    { _id: "single", _type: "event", title: "Talk", event_date: "2026-02-01" },
  ]);
  expect(ranged.end_date).toBe("2026-04-19T00:00:00.000Z");
  expect(single.end_date).toBeNull();
});

test("event query: co-hosts resolve to organisations beside the old names", async () => {
  const dataset = [
    { _id: "org-aws", _type: "organization", key: "aws", name: "AWS" },
    {
      _id: "evt-refs",
      _type: "event",
      title: "Hackathon",
      event_date: "2026-01-01",
      hosts: ["Amazon Web Services"],
      coHosts: [
        { _key: "aws", _type: "reference", _ref: "org-aws" },
        { _key: "gone", _type: "reference", _ref: "org-deleted" },
      ],
    },
    {
      _id: "evt-names",
      _type: "event",
      title: "Talk",
      event_date: "2026-02-01",
    },
  ];

  const [referenced, bare] = await run(EVENTS_QUERY, dataset);

  expect(referenced.coHosts).toStrictEqual([{ key: "aws", name: "AWS" }, null]);
  expect(referenced.hosts).toStrictEqual(["Amazon Web Services"]);
  expect(bare.coHosts).toBeNull();
  expect(bare.hosts).toStrictEqual([]);
});

test("research query: keywords stay an array, description falls back", async () => {
  const dataset = [
    {
      _id: "res-1",
      _type: "research",
      title: "Study",
      keywords: ["AI", "Machine Learning", "Robotics"],
    },
    { _id: "res-2", _type: "research", title: "No keywords" },
  ];

  const [project, bare] = await run(RESEARCH_QUERY, dataset);

  expect(project.keywords).toStrictEqual([
    "AI",
    "Machine Learning",
    "Robotics",
  ]);
  expect(project.description).toBe("");
  expect(project.id).toBe("res-1");
  expect(bare.keywords).toStrictEqual([]);
});

test("research query: institutions resolve to organisations, in order", async () => {
  const dataset = [
    { _id: "org-mit", _type: "organization", key: "mit", name: "MIT" },
    { _id: "org-tum", _type: "organization", key: "tum", name: "TUM" },
    {
      _id: "res-refs",
      _type: "research",
      title: "TUM, MIT: Study",
      institutions: [
        { _key: "tum", _type: "reference", _ref: "org-tum" },
        { _key: "gone", _type: "reference", _ref: "org-deleted" },
        { _key: "mit", _type: "reference", _ref: "org-mit" },
      ],
    },
    { _id: "res-title", _type: "research", title: "MIT: Study" },
  ];

  const [referenced, titled] = await run(RESEARCH_QUERY, dataset);

  expect(referenced.institutions).toStrictEqual([
    { key: "tum", name: "TUM" },
    null,
    { key: "mit", name: "MIT" },
  ]);
  expect(referenced.title).toBe("TUM, MIT: Study");
  expect(titled.institutions).toBeNull();
});

test("the page event query no longer fetches the unused detail text", async () => {
  const [event] = await run(EVENTS_QUERY, [
    {
      _id: "e",
      _type: "event",
      title: "T",
      event_date: "2026-01-01",
      detail: "x",
    },
  ]);
  expect(event).not.toHaveProperty("detail");
});

/**
 * The public API bodies (/api/getNotes, /api/getPartners, /api/getResearch)
 * are read by external consumers, so their keys and legacy formats are frozen.
 */
describe("public API query shapes are frozen", () => {
  test("events keep every legacy key, including detail", async () => {
    const [event] = await run(PUBLIC_EVENTS_QUERY, [
      {
        _id: "e",
        _type: "event",
        title: "T",
        event_date: "2026-01-01",
        detail: "Long text",
      },
    ]);
    expect(Object.keys(event).sort()).toStrictEqual(
      [
        "category",
        "city",
        "description",
        "detail",
        "event_date",
        "id",
        "images",
        "location",
        "poster",
        "sign_up",
        "title",
      ].sort(),
    );
    expect(event.detail).toBe("Long text");
  });

  test("events answer the same with co-host references", async () => {
    const [event] = await run(PUBLIC_EVENTS_QUERY, [
      { _id: "o", _type: "organization", key: "aws", name: "AWS" },
      {
        _id: "e",
        _type: "event",
        title: "T",
        event_date: "2026-01-01",
        hosts: ["AWS"],
        coHosts: [{ _key: "aws", _type: "reference", _ref: "o" }],
      },
    ]);
    expect(event).not.toHaveProperty("coHosts");
    expect(event).not.toHaveProperty("hosts");
  });

  test("research keeps keywords as one comma-joined string", async () => {
    const [project] = await run(PUBLIC_RESEARCH_QUERY, [
      { _id: "r", _type: "research", title: "S", keywords: ["AI", "ML"] },
    ]);
    expect(project.keywords).toBe("AI, ML");
    expect(Object.keys(project).sort()).toStrictEqual(
      [
        "description",
        "id",
        "image",
        "keywords",
        "publication",
        "status",
        "title",
      ].sort(),
    );
  });

  test("research answers the same with institution references", async () => {
    const [project] = await run(PUBLIC_RESEARCH_QUERY, [
      { _id: "o", _type: "organization", key: "mit", name: "MIT" },
      {
        _id: "r",
        _type: "research",
        title: "MIT: S",
        institutions: [{ _key: "mit", _type: "reference", _ref: "o" }],
      },
    ]);
    expect(project).not.toHaveProperty("institutions");
    expect(project.title).toBe("MIT: S");
  });

  const partnerKeys = [
    "category",
    "featured",
    "id",
    "image",
    "link",
    "name",
    "tier",
  ].sort();

  test("partners keep their keys", async () => {
    const [partner] = await run(PUBLIC_PARTNERS_QUERY, [
      { _id: "p", _type: "partner", name: "IBM" },
    ]);
    expect(Object.keys(partner).sort()).toStrictEqual(partnerKeys);
  });

  test("partner organisations answer in the same shape, with the old partner ids", async () => {
    const partners = await run(PUBLIC_PARTNER_ORGANIZATIONS_QUERY, [
      {
        _id: "image-logo",
        _type: "sanity.imageAsset",
        url: "https://cdn/x.png",
      },
      {
        _id: "organization-ibm",
        _type: "organization",
        key: "ibm",
        name: "IBM",
        href: "https://www.ibm.com/",
        logo: { asset: { _type: "reference", _ref: "image-logo" } },
        partnerTier: "bronze",
        partnerCategory: "Research Partners",
        legacyPartnerId: "XNCTBM8X9vP2N4tjVziXsW",
      },
      {
        _id: "organization-jetbrains",
        _type: "organization",
        key: "jetbrains",
        name: "JetBrains",
        partnerTier: "gold",
        partnerFeatured: true,
      },
      {
        _id: "organization-meta",
        _type: "organization",
        key: "meta",
        name: "Meta",
      },
    ]);
    expect(partners).toHaveLength(2);
    for (const partner of partners) {
      expect(Object.keys(partner).sort()).toStrictEqual(partnerKeys);
    }
    expect(partners).toStrictEqual([
      {
        id: "XNCTBM8X9vP2N4tjVziXsW",
        name: "IBM",
        link: "https://www.ibm.com/",
        image: "https://cdn/x.png",
        category: "Research Partners",
        tier: "bronze",
        featured: null,
      },
      {
        id: "organization-jetbrains",
        name: "JetBrains",
        link: null,
        image: null,
        category: null,
        tier: "gold",
        featured: true,
      },
    ]);
  });
});
