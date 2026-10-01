import { describe, expect, test } from "vitest";
import { hackathonFacts } from "@/config/hackathons";
import { getMockEvents } from "@/lib/mock-cms";
import { makeathonEditions } from "./data/makeathon";
import {
  buildMarks,
  type HackathonEvent,
  isHackathonEvent,
  nextMark,
  pastMarks,
} from "./marks";

const { league } = hackathonFacts;

const event = (overrides: Partial<HackathonEvent>): HackathonEvent => ({
  id: "event",
  title: "Hackathon",
  event_date: "2025-10-18T00:00:00.000Z",
  city: "Munich",
  category: "Hackathon",
  ...overrides,
});

const build = (events: HackathonEvent[]) =>
  buildMarks({
    editions: makeathonEditions,
    matches: league.matches,
    leagueName: league.name,
    events,
  });

describe("buildMarks", () => {
  test("every edition and every league match, in calendar order", () => {
    const marks = build([]);
    expect(marks.filter(({ kind }) => kind === "makeathon")).toHaveLength(
      makeathonEditions.length,
    );
    const starts = marks.map(({ start }) => start);
    expect(starts).toStrictEqual([...starts].sort());
  });

  test("the league match on a Makeathon is that Makeathon, flagged", () => {
    const marks = build([]);
    const onMakeathon = league.matches.filter(
      (match) => "makeathon" in match && match.makeathon,
    );
    expect(marks.filter(({ kind }) => kind === "league")).toHaveLength(
      league.matches.length - onMakeathon.length,
    );
    const flagged = marks.filter(({ league: isLeague }) => isLeague);
    expect(flagged.map(({ start }) => start)).toStrictEqual(
      onMakeathon.map(({ start }) => start),
    );
    expect(flagged.every(({ kind }) => kind === "makeathon")).toBe(true);
  });

  test("a CMS event on a Makeathon merges into it and lends its link", () => {
    const marks = build([
      event({
        id: "cms-makeathon",
        title: "Makeathon 2026",
        event_date: "2026-04-17T00:00:00.000Z",
        end_date: "2026-04-19T00:00:00.000Z",
        sign_up: "https://example.com/makeathon",
      }),
    ]);
    expect(marks.some(({ id }) => id === "event-cms-makeathon")).toBe(false);
    const edition = marks.find(({ id }) => id === "makeathon-2026");
    expect(edition?.title).toBe("Makeathon 2026");
    expect(edition?.href).toBe("https://example.com/makeathon");
  });

  test("an event the week before a Makeathon stays its own hackathon", () => {
    const marks = build([
      event({
        id: "agora",
        title: "Agora Hacks",
        event_date: "2026-04-10T16:00:00.000Z",
        end_date: "2026-04-12T16:00:00.000Z",
      }),
    ]);
    expect(marks.find(({ id }) => id === "event-agora")).toMatchObject({
      kind: "partner",
      start: "2026-04-10",
      end: "2026-04-12",
    });
  });

  test("an event in another city on a Makeathon's dates stays apart", () => {
    const marks = build([
      event({
        id: "elsewhere",
        event_date: "2026-04-18T10:00:00.000Z",
        city: "Online",
      }),
    ]);
    expect(marks.some(({ id }) => id === "event-elsewhere")).toBe(true);
  });

  test("events outside the Hackathon category are left out", () => {
    const marks = build([event({ id: "talk", category: "Speaker" })]);
    expect(marks.some(({ id }) => id === "event-talk")).toBe(false);
  });

  test("an event's days are its Munich dates; without an end, one day", () => {
    const [mark] = buildMarks({
      editions: [],
      matches: [],
      leagueName: league.name,
      events: [event({ id: "late", event_date: "2025-12-12T23:30:00.000Z" })],
    });
    expect(mark).toMatchObject({ start: "2025-12-13", end: "2025-12-13" });
  });

  test("the mock events: every Makeathon and league match is an event, every event drawn once", () => {
    const events = getMockEvents(new Date("2026-10-01T12:00:00Z"));
    const hackathons = events.filter(isHackathonEvent);
    const marks = build(events);
    const records = marks.filter(({ kind }) => kind !== "partner");
    const partners = marks.filter(({ kind }) => kind === "partner");
    // Hackathons are a subset of events: each edition and match merges one
    // event, and every other event is its own mark.
    expect(records.length + partners.length).toBe(hackathons.length);
    // No event is drawn twice: the partner marks are the rest.
    expect(new Set(partners.map(({ id }) => id)).size).toBe(partners.length);
  });
});

describe("pastMarks and nextMark", () => {
  const marks = build([]);

  test("past: over before today; next: the first running or ahead", () => {
    const finale = league.matches.at(-1);
    if (!finale) throw new Error("the season has a finale");
    const today = "2026-10-01";
    expect(pastMarks(marks, today).every(({ end }) => end < today)).toBe(true);
    expect(nextMark(marks, today)?.start).toBe(finale.start);
  });

  test("a hackathon running today is the next one, not a past one", () => {
    const today = "2026-04-18";
    expect(nextMark(marks, today)?.id).toBe("makeathon-2026");
    expect(
      pastMarks(marks, today).some(({ id }) => id === "makeathon-2026"),
    ).toBe(false);
  });

  test("nothing ahead: no next", () => {
    expect(nextMark(marks, "2099-01-01")).toBeUndefined();
  });
});
