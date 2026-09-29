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
