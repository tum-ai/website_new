import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  getMockEvents,
  getMockPartners,
  getMockResearchProjects,
  shouldUseMockCms,
} from "../src/lib/mock-cms.ts";

const publicDir = path.resolve(import.meta.dirname, "../public");

test("mock CMS data is opt-in and never used on Vercel", () => {
  assert.equal(shouldUseMockCms({}), false);
  assert.equal(shouldUseMockCms({ USE_MOCK_CMS: "0" }), false);
  assert.equal(shouldUseMockCms({ USE_MOCK_CMS: "1" }), true);
  assert.equal(shouldUseMockCms({ USE_MOCK_CMS: "1", VERCEL: "1" }), false);
});

test("mock events cover upcoming and past events across filters", () => {
  const now = new Date("2026-09-25T12:00:00Z");
  const events = getMockEvents(now);
  const upcoming = events.filter((event) => new Date(event.event_date) >= now);
  const past = events.filter((event) => new Date(event.event_date) < now);

  assert.ok(upcoming.length >= 3);
  assert.ok(past.length >= 3);
  assert.equal(new Set(events.map((event) => event.id)).size, events.length);
  for (const category of ["Hackathon", "Speaker", "Event", "E-Lab"]) {
    assert.ok(
      events.some((event) => event.category === category),
      category,
    );
  }
  for (const city of ["Munich", "Online"]) {
    assert.ok(
      events.some((event) => event.city === city),
      city,
    );
  }
  assert.ok(events.some((event) => event.description.length > 300));
  assert.ok(events.some((event) => event.sign_up));
  assert.ok(upcoming.some((event) => !event.sign_up));
});

test("mock research covers both statuses with local images only", () => {
  const projects = getMockResearchProjects();
  assert.ok(projects.some((project) => project.status === "ongoing"));
  assert.ok(projects.some((project) => project.status === "completed"));
  assert.ok(projects.some((project) => project.publication));

  const partners = getMockPartners();
  assert.ok(
    partners.every((partner) => partner.category === "Research Partners"),
  );

  const images = [
    ...getMockEvents().flatMap((event) => [
      event.poster,
      ...(event.images ?? []),
    ]),
    ...projects.map((project) => project.image),
    ...partners.map((partner) => partner.image),
  ].filter((image): image is string => Boolean(image));

  for (const image of images) {
    assert.ok(image.startsWith("/assets/"), image);
    assert.ok(existsSync(path.join(publicDir, image)), image);
  }
});
