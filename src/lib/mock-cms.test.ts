import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import {
  getMockEvents,
  getMockPartners,
  getMockResearchPartners,
  getMockResearchProjects,
} from "@/lib/mock-cms";
import { getMockCmsNow } from "@/lib/mock-cms-env";

// The USE_MOCK_CMS gate itself is tested through lib/sanity.ts (sanity.test.ts).

const publicDir = path.resolve(import.meta.dirname, "../../public");

describe("MOCK_CMS_NOW", () => {
  const fallback = new Date("2030-01-01T00:00:00Z");

  test("falls back to the current time when unset or blank", () => {
    expect(getMockCmsNow({}, fallback)).toBe(fallback);
    expect(getMockCmsNow({ MOCK_CMS_NOW: "  " }, fallback)).toBe(fallback);
  });

  test.each([
    ["2026-09-25", "2026-09-25T00:00:00.000Z"],
    ["2026-09-25T12:00:00Z", "2026-09-25T12:00:00.000Z"],
    ["2026-09-25T14:00+02:00", "2026-09-25T12:00:00.000Z"],
    ["2026-09-25T12:00:00.500Z", "2026-09-25T12:00:00.500Z"],
  ])("reads %s as %s", (value, expected) => {
    expect(getMockCmsNow({ MOCK_CMS_NOW: value }).toISOString()).toBe(expected);
  });

  test.each([
    "2026-09-25T12:00:00", // no offset: would depend on the machine's timezone
    "25.09.2026",
    "tomorrow",
    "2026-13-45",
  ])("rejects %s", (value) => {
    expect(() => getMockCmsNow({ MOCK_CMS_NOW: value })).toThrow(
      /MOCK_CMS_NOW/,
    );
  });
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

test("mock event dates follow the given now, so fixed dates render stably", () => {
  const now = new Date("2026-09-25T12:00:00Z");
  expect(getMockEvents(now)).toStrictEqual(getMockEvents(new Date(now)));
  expect(getMockEvents(now)[0].event_date).toBe("2026-10-04T18:00:00.000Z");
});

test("mock sign-up links are neutral placeholders, not real forms", () => {
  const signUps = getMockEvents().flatMap((event) =>
    event.sign_up ? [event.sign_up] : [],
  );
  expect(signUps.length).toBeGreaterThan(0);
  for (const link of signUps) {
    expect(link).toMatch(/^https:\/\/example\.com\//);
  }
});

test("mock research covers both statuses with local images only", () => {
  const projects = getMockResearchProjects();
  expect(projects.some((project) => project.status === "ongoing")).toBe(true);
  expect(projects.some((project) => project.status === "completed")).toBe(true);
  expect(projects.some((project) => project.publication)).toBe(true);
  expect(projects.every((project) => Array.isArray(project.keywords))).toBe(
    true,
  );

  const partners = getMockPartners();
  expect(getMockResearchPartners()).toStrictEqual(
    partners.filter((partner) => partner.category === "Research Partners"),
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
    expect(image).toMatch(/^\/assets\//);
    expect(existsSync(path.join(publicDir, image)), image).toBe(true);
  }
});
