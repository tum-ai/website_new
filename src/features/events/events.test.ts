import { afterAll, beforeAll, describe, expect, test } from "vitest";
import {
  formatEventDate,
  getEventPhotos,
  groupEventsByMonth,
  splitEvents,
} from "./events";

const at = (event_date: string, id = event_date) => ({ id, event_date });
const ids = (events: { id: string }[]) => events.map((event) => event.id);

/*
 * The server runs in UTC on Vercel and visitors sit in Munich. Every
 * expectation must hold whatever the process timezone is, so the whole
 * suite runs under several.
 */
describe.each([
  "UTC",
  "Europe/Berlin",
  "America/Los_Angeles",
  "Pacific/Kiritimati",
])("in process timezone %s", (timeZone) => {
  const original = process.env.TZ;
  beforeAll(() => {
    process.env.TZ = timeZone;
  });
  afterAll(() => {
    process.env.TZ = original;
  });

  describe("splitEvents", () => {
    const now = new Date("2026-10-01T12:00:00Z");

    test("an event starting exactly now is upcoming; a millisecond earlier is past", () => {
      const { upcoming, past } = splitEvents(
        [
          at("2026-10-01T11:59:59.999Z", "just-past"),
          at("2026-10-01T12:00:00Z", "now"),
        ],
        now,
      );
      expect(ids(upcoming)).toEqual(["now"]);
      expect(ids(past)).toEqual(["just-past"]);
    });

    test("compares instants, not wall-clock dates: an offset is honoured", () => {
      // 13:30 in Munich summer time is 11:30 UTC, before `now`.
      const { upcoming, past } = splitEvents(
        [
          at("2026-10-01T13:30:00+02:00", "earlier"),
          at("2026-10-01T14:30:00+02:00", "later"),
        ],
        now,
      );
      expect(ids(past)).toEqual(["earlier"]);
      expect(ids(upcoming)).toEqual(["later"]);
    });

    test("sorts upcoming soonest first and past newest first, leaving the input alone", () => {
      const events = [
        at("2026-09-02T10:00:00Z", "sep-2"),
        at("2026-12-01T10:00:00Z", "dec-1"),
        at("2026-06-15T10:00:00Z", "jun-15"),
        at("2026-10-05T10:00:00Z", "oct-5"),
      ];
      const input = [...events];
      const { upcoming, past } = splitEvents(events, now);
      expect(ids(upcoming)).toEqual(["oct-5", "dec-1"]);
      expect(ids(past)).toEqual(["sep-2", "jun-15"]);
      expect(events).toEqual(input);
    });
  });

  describe("groupEventsByMonth", () => {
    test("23:30 UTC on the last day of a month is the next month in Munich", () => {
      const months = groupEventsByMonth([
        at("2026-10-31T22:59:00Z", "oct"), // 23:59 CET, 31 October
        at("2026-10-31T23:30:00Z", "nov"), // 00:30 CET, 1 November
      ]);
      expect(
        months.map((month) => [
          month.key,
          month.monthName,
          month.year,
          ids(month.events),
        ]),
      ).toEqual([
        ["2026-10", "October", "2026", ["oct"]],
        ["2026-11", "November", "2026", ["nov"]],
      ]);
    });

    test("the year boundary follows Munich too", () => {
      const [month] = groupEventsByMonth([at("2026-12-31T23:15:00Z")]);
      expect([month.monthName, month.year]).toEqual(["January", "2027"]);
    });

    test("summer time: 22:30 UTC on 31 March 2026 is already April in Munich", () => {
      // Clocks went forward on 29 March 2026, so Munich is UTC+2.
      const months = groupEventsByMonth([
        at("2026-03-31T21:30:00Z", "march"), // 23:30 CEST
        at("2026-03-31T22:30:00Z", "april"), // 00:30 CEST
      ]);
      expect(months.map((month) => [month.key, ids(month.events)])).toEqual([
        ["2026-03", ["march"]],
        ["2026-04", ["april"]],
      ]);
    });

    test("the DST switch dates themselves stay in their month", () => {
      const months = groupEventsByMonth([
        at("2026-03-29T00:30:00Z", "spring"), // 01:30 CET, before the switch
        at("2026-03-29T01:30:00Z", "spring-after"), // 03:30 CEST
        at("2026-10-25T00:30:00Z", "autumn"), // 02:30 CEST
        at("2026-10-25T01:30:00Z", "autumn-after"), // 02:30 CET, the repeated hour
      ]);
      expect(months.map((month) => [month.key, ids(month.events)])).toEqual([
        ["2026-03", ["spring", "spring-after"]],
        ["2026-10", ["autumn", "autumn-after"]],
      ]);
    });

    test("keeps months in first-appearance order and events in input order", () => {
      const months = groupEventsByMonth([
        at("2026-11-20T10:00:00Z", "nov-20"),
        at("2026-10-03T10:00:00Z", "oct-3"),
        at("2026-11-02T10:00:00Z", "nov-2"),
      ]);
      expect(months.map((month) => [month.key, ids(month.events)])).toEqual([
        ["2026-11", ["nov-20", "nov-2"]],
        ["2026-10", ["oct-3"]],
      ]);
    });

    test("is empty for no events", () => {
      expect(groupEventsByMonth([])).toEqual([]);
    });
  });

  describe("formatEventDate", () => {
    test("labels the Munich calendar day, not the UTC one", () => {
      expect(formatEventDate("2026-10-31T23:30:00Z")).toEqual({
        dateTime: "2026-10-31T23:30:00Z",
        long: "November 1st, 2026",
        day: "01",
        monthShort: "Nov",
        weekday: "Sun",
      });
    });

    test("an evening event in summer time keeps its day", () => {
      expect(formatEventDate("2026-07-15T21:30:00Z").long).toBe(
        "July 15th, 2026",
      );
      expect(formatEventDate("2026-07-15T22:30:00Z").long).toBe(
        "July 16th, 2026",
      );
    });
  });
});

describe("getEventPhotos", () => {
  const base = { title: "Makeathon" };

  test("prefers the photos, labelled in order", () => {
    expect(
      getEventPhotos({
        ...base,
        images: ["/a.webp", "/b.webp"],
        poster: "/p.webp",
      }),
    ).toEqual([
      { src: "/a.webp", alt: "Makeathon Image 1" },
      { src: "/b.webp", alt: "Makeathon Image 2" },
    ]);
  });

  test("falls back to the poster, then to nothing", () => {
    expect(getEventPhotos({ ...base, images: [], poster: "/p.webp" })).toEqual([
      { src: "/p.webp", alt: "Makeathon Poster" },
    ]);
    expect(getEventPhotos({ ...base, images: [] })).toEqual([]);
  });

  test("lists an asset used as both poster and photo once", () => {
    // The query returns [poster, img]; both may reference one asset.
    expect(
      getEventPhotos({
        ...base,
        images: ["/a.webp", "/a.webp"],
        poster: "/a.webp",
      }),
    ).toEqual([{ src: "/a.webp", alt: "Makeathon Image 1" }]);
  });
});
