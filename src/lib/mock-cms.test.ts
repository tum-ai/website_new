import { existsSync } from "node:fs";
import path from "node:path";
import { expect, test } from "vitest";
import {
  getMockEvents,
  getMockPartners,
  getMockResearchProjects,
  shouldUseMockCms,
} from "@/lib/mock-cms";

const publicDir = path.resolve(import.meta.dirname, "../../public");

test("mock CMS data is opt-in and never used on Vercel", () => {
  expect(shouldUseMockCms({})).toBe(false);
  expect(shouldUseMockCms({ USE_MOCK_CMS: "0" })).toBe(false);
  expect(shouldUseMockCms({ USE_MOCK_CMS: "1" })).toBe(true);
  expect(shouldUseMockCms({ USE_MOCK_CMS: "1", VERCEL: "1" })).toBe(false);
});

test("mock events cover upcoming and past events across filters", () => {
  const now = new Date("2026-09-25T12:00:00Z");
  const events = getMockEvents(now);
  const upcoming = events.filter((event) => new Date(event.event_date) >= now);
  const past = events.filter((event) => new Date(event.event_date) < now);

  expect(upcoming.length).toBeGreaterThanOrEqual(3);
  expect(past.length).toBeGreaterThanOrEqual(3);
  expect(new Set(events.map((event) => event.id)).size).toBe(events.length);
  for (const category of ["Hackathon", "Speaker", "Event", "E-Lab"]) {
    expect(
      events.some((event) => event.category === category),
      category,
    ).toBe(true);
  }
  for (const city of ["Munich", "Online"]) {
    expect(
      events.some((event) => event.city === city),
      city,
    ).toBe(true);
  }
  expect(events.some((event) => event.description.length > 300)).toBe(true);
  expect(events.some((event) => event.sign_up)).toBe(true);
  expect(upcoming.some((event) => !event.sign_up)).toBe(true);
});

test("mock research covers both statuses with local images only", () => {
  const projects = getMockResearchProjects();
  expect(projects.some((project) => project.status === "ongoing")).toBe(true);
  expect(projects.some((project) => project.status === "completed")).toBe(true);
  expect(projects.some((project) => project.publication)).toBe(true);

  const partners = getMockPartners();
  expect(
    partners.every((partner) => partner.category === "Research Partners"),
  ).toBe(true);

  const images = [
    ...getMockEvents().flatMap((event) => [
      event.poster,
      ...(event.images ?? []),
    ]),
    ...projects.map((project) => project.image),
    ...partners.map((partner) => partner.image),
  ].filter((image): image is string => Boolean(image));

  for (const image of images) {
    expect(image).toMatch(/^\/assets\//);
    expect(existsSync(path.join(publicDir, image)), image).toBe(true);
  }
});
