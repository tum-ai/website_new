import assert from "node:assert/strict";
import test from "node:test";
import {
  mapEventPage,
  mapPartnerPage,
  mapResearchPage,
} from "../packages/notion-data/src/index.ts";

test("mapEventPage normalizes legacy Notion property names", () => {
  const event = mapEventPage({
    id: "event-1",
    properties: {
      title: { title: [{ plain_text: "Hackathon" }] },
      desc: { rich_text: [{ plain_text: "Build something real." }] },
      event_date: { date: { start: "2026-04-10" } },
      location: { rich_text: [{ plain_text: "Munich" }] },
      city: { select: { name: "Munich" } },
      category: { select: { name: "Hackathon" } },
      poster: {
        files: [{ file: { url: "https://cdn.example.com/poster.webp" } }],
      },
      img: {
        files: [
          { file: { url: "https://cdn.example.com/1.webp" } },
          { external: { url: "https://cdn.example.com/2.webp" } },
        ],
      },
      sign_up: { rich_text: [{ plain_text: "https://tum-ai.com/apply" }] },
      detail: { rich_text: [{ plain_text: "Longer description" }] },
    },
  });

  assert.deepEqual(event, {
    id: "event-1",
    title: "Hackathon",
    description: "Build something real.",
    event_date: "2026-04-10",
    location: "Munich",
    city: "Munich",
    category: "Hackathon",
    poster: "https://cdn.example.com/poster.webp",
    images: [
      "https://cdn.example.com/1.webp",
      "https://cdn.example.com/2.webp",
    ],
    sign_up: "https://tum-ai.com/apply",
    detail: "Longer description",
  });
});

test("mapPartnerPage normalizes partner rows", () => {
  const partner = mapPartnerPage({
    id: "partner-1",
    properties: {
      name: { title: [{ plain_text: "OpenAI" }] },
      link: { rich_text: [{ plain_text: "https://openai.com" }] },
      image: {
        files: [{ external: { url: "https://cdn.example.com/logo.svg" } }],
      },
    },
  });

  assert.deepEqual(partner, {
    id: "partner-1",
    name: "OpenAI",
    link: "https://openai.com",
    image: "https://cdn.example.com/logo.svg",
  });
});

test("mapResearchPage includes keywords when present", () => {
  const project = mapResearchPage({
    id: "research-1",
    properties: {
      Title: { title: [{ plain_text: "Robotics" }] },
      Description: { rich_text: [{ plain_text: "Perception stack." }] },
      Image: {
        files: [{ file: { url: "https://cdn.example.com/research.webp" } }],
      },
      Publication: { rich_text: [{ plain_text: "arXiv:1234.5678" }] },
      Status: { select: { name: "Active" } },
      Keywords: { rich_text: [{ plain_text: "robotics, vision" }] },
    },
  });

  assert.deepEqual(project, {
    id: "research-1",
    title: "Robotics",
    description: "Perception stack.",
    image: "https://cdn.example.com/research.webp",
    publication: "arXiv:1234.5678",
    status: "Active",
    keywords: "robotics, vision",
  });
});
