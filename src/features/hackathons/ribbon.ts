/**
 * The geometry of the /hackathons ribbon: every hackathon placed on a
 * linear time axis at its real dates. Pure and isomorphic, unit-tested; the
 * components only turn the fractions into CSS.
 *
 * Units are whole days (`dayNumber`), and positions are fractions of the
 * track's width, so the figure is exact at any size. A mark is drawn at
 * least {@link RIBBON.minPx} wide, since at site widths a weekend is a pixel
 * or two: the floor is the only place the figure departs from scale.
 *
 * Makeathons sit above the axis in lane 0. Every other hackathon hangs
 * below it, in the first lane (1, 2, ...) where it clears the previous mark
 * by {@link RIBBON.gapPx}; lanes are worked out at the narrowest width the
 * track is drawn at, so they never collide at any wider one.
 */
import type { HackathonMark } from "./marks";

export const RIBBON = {
  /** The narrowest a mark is drawn (CSS px). */
  minPx: 5,
  /** The space a lane keeps between two marks (CSS px). */
  gapPx: 3,
  /**
   * The narrowest the track is drawn: from the md breakpoint, 768px less the
   * page gutters. Phones scroll a wider track sideways (`RibbonReplay`).
   */
  referenceWidth: 680,
  /** Days the axis runs on after the last mark (or today), so it doesn't end on a mark. */
  tailDays: 45,
} as const;

/** Days since the epoch of a calendar day ("YYYY-MM-DD"). */
export function dayNumber(day: string): number {
  const [year, month, date] = day.split("-").map(Number);
  return Date.UTC(year, month - 1, date) / 86_400_000;
}

const yearOf = (day: string) => Number(day.slice(0, 4));
const newYear = (year: number) => dayNumber(`${year}-01-01`);

/** A mark placed on a track. */
export type PlacedMark = {
  id: string;
  /** Left edge, a fraction of the track's width. */
  x: number;
  /** Width at true scale, a fraction of the track's width (CSS floors it). */
  w: number;
  /** 0 above the axis (Makeathons), 1 and up below it. */
  lane: number;
};

type Span = { id: string; makeathon: boolean; from: number; to: number };

/**
 * Places spans on a track from `origin` that is `length` days long, and
 * deals them into lanes at `referenceWidth` px.
 */
function place(
  spans: readonly Span[],
  origin: number,
  length: number,
  referenceWidth: number,
): { marks: PlacedMark[]; lanes: number } {
  const minW = RIBBON.minPx / referenceWidth;
  const gap = RIBBON.gapPx / referenceWidth;
  const laneEnds: number[] = [];
  const marks = [...spans]
    .sort((a, b) => a.from - b.from || a.to - b.to)
    .map((span) => {
      const x = (span.from - origin) / length;
      const w = (span.to - span.from + 1) / length;
      if (span.makeathon) return { id: span.id, x, w, lane: 0 };
      const drawnEnd = x + Math.max(w, minW);
      let lane = laneEnds.findIndex((end) => end + gap <= x);
      if (lane === -1) lane = laneEnds.push(drawnEnd) - 1;
      else laneEnds[lane] = drawnEnd;
      return { id: span.id, x, w, lane: lane + 1 };
    });
  return { marks, lanes: laneEnds.length };
}

const spanOf = (mark: HackathonMark): Span => ({
  id: mark.id,
  makeathon: mark.kind === "makeathon",
  from: dayNumber(mark.start),
  to: dayNumber(mark.end),
});

/** The continuous ribbon, as {@link layoutRibbon} returns it. */
export type RibbonLayout = {
  marks: PlacedMark[];
  /** Lanes below the axis. */
  lanes: number;
  /** 1 January of each year on the axis. */
  years: { year: number; x: number }[];
  /** The axis: its first day (a day number) and its length in days. */
  axis: { origin: number; days: number };
};

/**
 * The record on one axis: from 1 January of the first hackathon's year (or
 * from the day `from`, leaving out what ended before it and cutting what
 * started before it) to {@link RIBBON.tailDays} after the last one or
 * `today`, whichever is later.
 */
export function layoutRibbon(
  marks: readonly HackathonMark[],
  today: string,
  { from }: { from?: string } = {},
): RibbonLayout {
  const origin = from
    ? dayNumber(from)
    : newYear(yearOf(marks[0]?.start ?? today));
  const spans = marks
    .map(spanOf)
    .filter(({ to }) => to >= origin)
    .map((span) => ({ ...span, from: Math.max(span.from, origin) }));
  if (spans.length === 0) {
    return { marks: [], lanes: 0, years: [], axis: { origin, days: 0 } };
  }
  const last = Math.max(dayNumber(today), ...spans.map(({ to }) => to));
  const length = last + RIBBON.tailDays - origin + 1;
  const placed = place(spans, origin, length, RIBBON.referenceWidth);
  const yearAt = (day: number) => new Date(day * 86_400_000).getUTCFullYear();
  const years = [];
  for (let year = yearAt(origin); year <= yearAt(origin + length - 1); year++) {
    const x = (newYear(year) - origin) / length;
    if (x >= 0) years.push({ year, x });
  }
  return { ...placed, years, axis: { origin, days: length } };
}

/** The index of the mark whose centre is nearest to `x` (a track fraction). */
export function nearestMark(
  marks: readonly Pick<PlacedMark, "x" | "w">[],
  x: number,
): number {
  let best = -1;
  let bestDistance = Number.POSITIVE_INFINITY;
  marks.forEach((mark, index) => {
    const distance = Math.abs(mark.x + mark.w / 2 - x);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const parts = (day: string) => {
  const [year, month, date] = day.split("-").map(Number);
  return { year, month: monthNames[month - 1], date };
};

/**
 * A date range in words, without dashes: "18 April 2021", "26 to 28 April
 * 2024", "30 September to 2 October 2022", "30 December 2025 to 2 January
 * 2026". `short` abbreviates the month and drops the year, for a register
 * with a spaced hyphen as the ds `KeyDates` shows ranges: "17 - 19 Apr".
 * `year: false` drops the year where something beside it states it ("26 to
 * 28 April"); a range across New Year keeps both.
 */
export function formatDayRange(
  start: string,
  end: string,
  { short = false, year = true }: { short?: boolean; year?: boolean } = {},
): string {
  const a = parts(start);
  const b = parts(end);
  if (short) {
    const month = (name: string) => name.slice(0, 3);
    if (start === end) return `${a.date} ${month(a.month)}`;
    return a.month === b.month && a.year === b.year
      ? `${a.date} - ${b.date} ${month(b.month)}`
      : `${a.date} ${month(a.month)} - ${b.date} ${month(b.month)}`;
  }
  if (a.year !== b.year) {
    return `${a.date} ${a.month} ${a.year} to ${b.date} ${b.month} ${b.year}`;
  }
  const tail = year ? ` ${b.year}` : "";
  if (start === end) return `${a.date} ${a.month}${tail}`;
  return a.month === b.month
    ? `${a.date} to ${b.date} ${b.month}${tail}`
    : `${a.date} ${a.month} to ${b.date} ${b.month}${tail}`;
}

/** The league's season as one route, from {@link layoutSeason}. */
export type SeasonLayout = {
  /** Each match's column centre, a fraction of the route's width. */
  columns: number[];
  /**
   * How far the season has come: a fraction of the line from the first
   * match to the last, which advances between two matches in proportion to
   * the days that have passed between their starts.
   */
  progress: number;
};

/**
 * A league season as one route: each match in an even column, so the
 * names never collide, joined by one line that is lit as far as today.
 * The columns are even, the light is exact: between two matches it
 * advances by the share of days gone between their first days.
 */
export function layoutSeason(
  matches: readonly { start: string }[],
  today: string,
): SeasonLayout {
  const count = matches.length;
  const columns = matches.map((_, index) => (index + 0.5) / count);
  if (count < 2) return { columns, progress: count === 1 ? 1 : 0 };
  const now = dayNumber(today);
  const starts = matches.map(({ start }) => dayNumber(start));
  let progress = 0;
  if (now >= starts[count - 1]) {
    progress = 1;
  } else if (now > starts[0]) {
    const segment = starts.findIndex((_, index) => now < starts[index + 1]);
    const share =
      (now - starts[segment]) / (starts[segment + 1] - starts[segment]);
    progress = (segment + share) / (count - 1);
  }
  return { columns, progress };
}
