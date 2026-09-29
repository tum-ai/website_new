/** Munich calendar dates as "YYYY-MM-DD" (the en-CA order). */
const berlinIsoDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * The Munich calendar date that contains `instant`, as "YYYY-MM-DD", e.g.
 * for `<time dateTime>`: 2026-09-27T22:30:00Z is "2026-09-28".
 */
export function munichIsoDate(instant: Date): string {
  return berlinIsoDay.format(instant);
}

/**
 * Days since the epoch of the Munich calendar day that contains `instant`:
 * consecutive days differ by exactly 1 across daylight saving changes, so
 * differences count calendar days.
 */
export function munichDayNumber(instant: Date): number {
  const [year, month, day] = munichIsoDate(instant).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
}

const berlinParts = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * The instant of a Munich wall-clock time, e.g. ("26.09.2026", "23:59") →
 * 2026-09-26T21:59:00Z. Editors write dates the way the site shows them;
 * summer and winter time are resolved here, independent of the server's
 * timezone. Throws on malformed input so a typo fails the build and tests.
 */
export function parseMunichDateTime(date: string, time: string): Date {
  const dateMatch = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time);
  if (!dateMatch || !timeMatch) {
    throw new Error(
      `Expected "DD.MM.YYYY" and "HH:MM", got "${date}" and "${time}"`,
    );
  }
  const [, day, month, year] = dateMatch.map(Number);
  const [, hour, minute] = timeMatch.map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day, hour, minute);

  // Munich's offset at that moment: format the instant in Europe/Berlin and
  // compare it with the same wall-clock reading taken as UTC.
  const parts = Object.fromEntries(
    berlinParts
      .formatToParts(new Date(wallClockAsUtc))
      .map((part) => [part.type, Number(part.value)]),
  );
  const berlinAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
  );
  return new Date(wallClockAsUtc - (berlinAsUtc - wallClockAsUtc));
}

const munichDatePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
const isoDayPattern = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Whether year, month and day name a real calendar day (no 31.02.). */
function isCalendarDay(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const twoDigits = (value: number) => String(value).padStart(2, "0");

/**
 * A Sanity `date` value ("2026-10-27", a calendar day without a timezone)
 * in the site's "DD.MM.YYYY" form ("27.10.2026"), or `null` when it is not a
 * real calendar day. The CMS stores dates as ISO days; code and
 * {@link parseMunichDateTime} use the form the site shows.
 */
export function munichDateFromIsoDay(isoDay: string): string | null {
  const match = isoDayPattern.exec(isoDay);
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  return isCalendarDay(year, month, day)
    ? `${twoDigits(day)}.${twoDigits(month)}.${year}`
    : null;
}

/** "27.10.2026" as the ISO day "2026-10-27" (a Sanity `date` value). Throws on malformed input. */
export function isoDayFromMunichDate(date: string): string {
  const match = munichDatePattern.exec(date);
  if (!match) throw new Error(`Expected "DD.MM.YYYY", got "${date}"`);
  const [day, month, year] = match.slice(1).map(Number);
  if (!isCalendarDay(year, month, day)) {
    throw new Error(`Not a calendar day: "${date}"`);
  }
  return `${year}-${twoDigits(month)}-${twoDigits(day)}`;
}

/** Whether `time` is a 24-hour "HH:MM" wall-clock time ("00:00" to "23:59"). */
export function isMunichTime(time: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
}

/** The calendar day after a "DD.MM.YYYY" day, in the same form. */
export function nextMunichDate(date: string): string {
  const [year, month, day] = isoDayFromMunichDate(date).split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  return `${twoDigits(next.getUTCDate())}.${twoDigits(next.getUTCMonth() + 1)}.${next.getUTCFullYear()}`;
}
