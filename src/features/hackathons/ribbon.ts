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
 * layout is shown at, so they never collide at any wider one.
 */
import type { HackathonMark } from "./marks";

export const RIBBON = {
  /** The narrowest a mark is drawn (CSS px). */
  minPx: 5,
  /** The space a lane keeps between two marks (CSS px). */
  gapPx: 3,
  /**
   * The narrowest track each layout is shown at: the continuous one from
   * the md breakpoint (768px less the page gutters), the yearly rows on a
   * 320px phone (less the gutters and the year column).
   */
  referenceWidth: { continuous: 680, byYear: 240 },
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
  const placed = place(spans, origin, length, RIBBON.referenceWidth.continuous);
  const yearAt = (day: number) => new Date(day * 86_400_000).getUTCFullYear();
  const years = [];
  for (let year = yearAt(origin); year <= yearAt(origin + length - 1); year++) {
    const x = (newYear(year) - origin) / length;
    if (x >= 0) years.push({ year, x });
  }
  return { ...placed, years, axis: { origin, days: length } };
}

/** One row of the yearly ribbon. */
export type RibbonYear = {
  year: number;
  marks: PlacedMark[];
  /** Lanes below the axis in this row. */
  lanes: number;
};

/**
 * The record wrapped into one row per year, each on the same scale (a
 * calendar year across the row), for narrow screens. A hackathon over New
 * Year is cut at 31 December. Every year from the first to the last
 * hackathon's has a row, even one without any.
 */
export function layoutByYear(marks: readonly HackathonMark[]): RibbonYear[] {
  if (marks.length === 0) return [];
  const first = yearOf(marks[0].start);
  const last = Math.max(...marks.map(({ start }) => yearOf(start)));
  const rows: RibbonYear[] = [];
  for (let year = first; year <= last; year++) {
    const origin = newYear(year);
    const length = newYear(year + 1) - origin;
    const spans = marks
      .filter(({ start }) => yearOf(start) === year)
      .map((mark) => {
        const span = spanOf(mark);
        return { ...span, to: Math.min(span.to, origin + length - 1) };
      });
    rows.push({
      year,
      ...place(spans, origin, length, RIBBON.referenceWidth.byYear),
    });
  }
  return rows;
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
