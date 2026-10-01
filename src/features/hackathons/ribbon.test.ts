import { describe, expect, test } from "vitest";
import { hackathonFacts } from "@/config/hackathons";
import { getMockEvents } from "@/lib/mock-cms";
import { makeathonEditions } from "./data/makeathon";
import { buildMarks, type HackathonMark } from "./marks";
import {
  dayNumber,
  formatDayRange,
  layoutByYear,
  layoutRibbon,
  nearestMark,
  type PlacedMark,
  RIBBON,
} from "./ribbon";

const today = "2026-10-01";
const marks = buildMarks({
  editions: makeathonEditions,
  matches: hackathonFacts.league.matches,
  leagueName: hackathonFacts.league.name,
  events: getMockEvents(new Date(`${today}T12:00:00Z`)),
});

const mark = (
  id: string,
  start: string,
  end = start,
  kind: HackathonMark["kind"] = "partner",
): HackathonMark => ({ id, title: id, kind, start, end });

/** No two marks of a lane overlap at `width` px, floors and gaps included. */
function expectNoCollisions(placed: readonly PlacedMark[], width: number) {
  const byLane = Map.groupBy(placed, ({ lane }) => lane);
  for (const [lane, inLane] of byLane) {
    const sorted = [...inLane].sort((a, b) => a.x - b.x);
    for (let index = 1; index < sorted.length; index++) {
      const previous = sorted[index - 1];
      const right =
        (previous.x + Math.max(previous.w, RIBBON.minPx / width)) * width;
      const gap = lane === 0 ? 0 : RIBBON.gapPx;
      expect(right + gap, `lane ${lane}`).toBeLessThanOrEqual(
        sorted[index].x * width + 1e-9,
      );
    }
  }
}

describe("layoutRibbon", () => {
  const layout = layoutRibbon(marks, today);

  test("every mark once, on the track", () => {
    expect(layout.marks.map(({ id }) => id).sort()).toStrictEqual(
      marks.map(({ id }) => id).sort(),
    );
    for (const placed of layout.marks) {
      expect(placed.x).toBeGreaterThanOrEqual(0);
      expect(placed.x + placed.w).toBeLessThanOrEqual(1);
    }
  });

  test("to scale: equal durations are equal widths, and order is date order", () => {
    const [a, b] = layoutRibbon(
      [
        mark("a", "2024-03-01", "2024-03-03"),
        mark("b", "2025-07-10", "2025-07-12"),
      ],
      today,
    ).marks;
    expect(a.w).toBeCloseTo(b.w, 12);
    expect(a.x).toBeLessThan(b.x);
    const span = dayNumber("2025-07-10") - dayNumber("2024-03-01");
    expect((b.x - a.x) / a.w).toBeCloseTo(span / 3, 9);
  });

  test("the axis starts on 1 January of the first year, with a tick per year", () => {
    expect(layout.years[0]).toStrictEqual({ year: 2021, x: 0 });
    expect(layout.years.map(({ year }) => year)).toStrictEqual([
      2021, 2022, 2023, 2024, 2025, 2026,
    ]);
  });

  test("Makeathons sit above the axis, everything else below", () => {
    for (const placed of layout.marks) {
      const isMakeathon = placed.id.startsWith("makeathon-");
      expect(placed.lane === 0, placed.id).toBe(isMakeathon);
    }
  });

  test("no lane collides at the narrowest width it is shown at", () => {
    expectNoCollisions(layout.marks, RIBBON.referenceWidth.continuous);
    expect(layout.lanes).toBeGreaterThanOrEqual(2);
  });

  test("a mark too close to the last one takes the next lane", () => {
    const { marks: placed, lanes } = layoutRibbon(
      [
        mark("a", "2025-10-18"),
        mark("b", "2025-10-19"),
        mark("c", "2026-06-01"),
      ],
      today,
    );
    expect(placed.map(({ lane }) => lane)).toStrictEqual([1, 2, 1]);
    expect(lanes).toBe(2);
  });

  test("from a day: earlier hackathons left out, the axis starting there", () => {
    const from = "2025-10-01";
    const window = layoutRibbon(marks, today, { from });
    const shown = marks.filter(({ end }) => end >= from);
    expect(window.marks.map(({ id }) => id).sort()).toStrictEqual(
      shown.map(({ id }) => id).sort(),
    );
    expect(Math.min(...window.marks.map(({ x }) => x))).toBeGreaterThanOrEqual(
      0,
    );
    expect(window.years.map(({ year }) => year)).toStrictEqual([2026]);
  });

  test("no marks: an empty figure", () => {
    const empty = layoutRibbon([], today);
    expect(empty).toMatchObject({ marks: [], lanes: 0, years: [] });
  });
});

describe("layoutByYear", () => {
  const rows = layoutByYear(marks);

  test("a row per year, every mark in the row of its start", () => {
    expect(rows.map(({ year }) => year)).toStrictEqual([
      2021, 2022, 2023, 2024, 2025, 2026,
    ]);
    expect(rows.flatMap((row) => row.marks).length).toBe(marks.length);
    for (const row of rows) {
      for (const placed of row.marks) {
        const source = marks.find(({ id }) => id === placed.id);
        expect(source?.start.startsWith(String(row.year))).toBe(true);
      }
    }
  });

  test("each row is its calendar year, and no lane collides on a phone", () => {
    for (const row of rows) {
      for (const placed of row.marks) {
        expect(placed.x + placed.w).toBeLessThanOrEqual(1);
      }
      expectNoCollisions(row.marks, RIBBON.referenceWidth.byYear);
    }
  });

  test("a hackathon over New Year is cut at 31 December", () => {
    const [row] = layoutByYear([mark("nye", "2025-12-30", "2026-01-02")]);
    expect(row.marks[0].x + row.marks[0].w).toBeCloseTo(1, 12);
  });
});

describe("nearestMark", () => {
  test("the mark whose centre is closest", () => {
    const placed = [
      { x: 0.1, w: 0.02 },
      { x: 0.5, w: 0.02 },
      { x: 0.9, w: 0.02 },
    ];
    expect(nearestMark(placed, 0)).toBe(0);
    expect(nearestMark(placed, 0.45)).toBe(1);
    expect(nearestMark(placed, 1)).toBe(2);
    expect(nearestMark([], 0.5)).toBe(-1);
  });
});

describe("formatDayRange", () => {
  test.each([
    ["2021-04-18", "2021-04-18", "18 April 2021", "18 Apr"],
    ["2024-04-26", "2024-04-28", "26 to 28 April 2024", "26 - 28 Apr"],
    [
      "2022-09-30",
      "2022-10-02",
      "30 September to 2 October 2022",
      "30 Sep - 2 Oct",
    ],
    [
      "2025-12-30",
      "2026-01-02",
      "30 December 2025 to 2 January 2026",
      "30 Dec - 2 Jan",
    ],
  ])("%s to %s", (start, end, long, short) => {
    expect(formatDayRange(start, end)).toBe(long);
    expect(formatDayRange(start, end, { short: true })).toBe(short);
  });

  test("without the year, unless the range crosses New Year", () => {
    expect(formatDayRange("2024-04-26", "2024-04-28", { year: false })).toBe(
      "26 to 28 April",
    );
    expect(formatDayRange("2021-04-18", "2021-04-18", { year: false })).toBe(
      "18 April",
    );
    expect(formatDayRange("2025-12-30", "2026-01-02", { year: false })).toBe(
      "30 December 2025 to 2 January 2026",
    );
  });
});
