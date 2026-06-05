import assert from "node:assert/strict";
import test from "node:test";
import { evaluate, parse } from "groq-js";
import { EVENTS_QUERY, RESEARCH_QUERY } from "../src/lib/sanity-queries";

async function run(query: string, dataset: unknown[]) {
  const value = await evaluate(parse(query), { dataset });
  return value.get();
}

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

  const result = await run(EVENTS_QUERY, dataset);
  const byId = Object.fromEntries(result.map((e: any) => [e.id, e]));

  assert.deepEqual(byId["evt-both"].images, [
    "https://cdn/poster.png",
    "https://cdn/img.png",
  ]);
  assert.deepEqual(byId["evt-poster-only"].images, ["https://cdn/poster.png"]);
  assert.ok(Array.isArray(byId["evt-poster-only"].images));
  assert.equal(byId["evt-poster-only"].description, "");
  assert.equal(byId["evt-both"].id, "evt-both");
});

test("research query: keywords joined to a string, description falls back", async () => {
  const dataset = [
    {
      _id: "res-1",
      _type: "research",
      title: "Study",
      keywords: ["AI", "Machine Learning", "Robotics"],
    },
  ];

  const [project] = await run(RESEARCH_QUERY, dataset);

  assert.equal(typeof project.keywords, "string");
  assert.equal(project.keywords, "AI, Machine Learning, Robotics");
  assert.equal(project.description, "");
  assert.equal(project.id, "res-1");
});
