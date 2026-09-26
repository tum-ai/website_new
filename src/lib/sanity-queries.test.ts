import { evaluate, parse } from "groq-js";
import { describe, expect, test } from "vitest";
import {
  EVENTS_QUERY,
  PARTNERS_QUERY,
  PUBLIC_EVENTS_QUERY,
  PUBLIC_PARTNERS_QUERY,
  PUBLIC_RESEARCH_QUERY,
  RESEARCH_PARTNERS_QUERY,
  RESEARCH_QUERY,
} from "@/lib/sanity-queries";

async function run(query: string, dataset: unknown[]) {
  const value = await evaluate(parse(query), { dataset });
  return value.get();
}

test("partner query preserves legacy fields while exposing optional wall settings", async () => {
  const [legacy, current] = await run(PARTNERS_QUERY, [
    {
      _id: "legacy",
      _type: "partner",
      name: "IBM",
      category: "Research Partners",
    },
    {
      _id: "current",
      _type: "partner",
      name: "Google",
      tier: "gold",
      featured: true,
    },
  ]);
  expect(legacy.id).toBe("legacy");
  expect(legacy.category).toBe("Research Partners");
  expect(legacy.tier).toBeNull();
  expect(current.tier).toBe("gold");
  expect(current.featured).toBe(true);
});

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

test("research partners query filters the category in GROQ", async () => {
  const partners = await run(RESEARCH_PARTNERS_QUERY, [
    { _id: "a", _type: "partner", name: "IBM", category: "Research Partners" },
    { _id: "b", _type: "partner", name: "Acme", category: "Industry" },
    { _id: "c", _type: "partner", name: "Legacy" },
  ]);
  expect(partners.map((partner: { id: string }) => partner.id)).toStrictEqual([
    "a",
  ]);
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

  test("partners keep their keys", async () => {
    const [partner] = await run(PUBLIC_PARTNERS_QUERY, [
      { _id: "p", _type: "partner", name: "IBM" },
    ]);
    expect(Object.keys(partner).sort()).toStrictEqual(
      ["category", "featured", "id", "image", "link", "name", "tier"].sort(),
    );
  });
});
