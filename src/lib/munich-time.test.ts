import { describe, expect, test } from "vitest";
import {
  isMunichTime,
  isoDayFromMunichDate,
  munichDateFromIsoDay,
  munichDayNumber,
  munichIsoDate,
  nextMunichDate,
  parseMunichDateTime,
} from "./munich-time";

describe("parseMunichDateTime", () => {
  test("reads summer and winter time", () => {
    expect(parseMunichDateTime("28.09.2026", "00:00").toISOString()).toBe(
      "2026-09-27T22:00:00.000Z",
    );
    expect(parseMunichDateTime("27.10.2026", "23:59").toISOString()).toBe(
      "2026-10-27T22:59:00.000Z",
    );
  });

  test("rejects malformed input", () => {
    expect(() => parseMunichDateTime("2026-09-28", "00:00")).toThrow();
    expect(() => parseMunichDateTime("28.09.2026", "0:00")).toThrow();
  });
});

describe("munichIsoDate", () => {
  test("is the Munich calendar date, not the UTC one", () => {
    // 00:30 in Munich summer time on 28 September.
    expect(munichIsoDate(new Date("2026-09-27T22:30:00Z"))).toBe("2026-09-28");
    expect(munichIsoDate(new Date("2026-09-27T21:30:00Z"))).toBe("2026-09-27");
  });
});

describe("munichDayNumber", () => {
  test("gives consecutive numbers to consecutive Munich days", () => {
    expect(
      munichDayNumber(new Date("2026-10-26T12:00:00Z")) -
        munichDayNumber(new Date("2026-10-25T12:00:00Z")),
    ).toBe(1);
  });

  test("counts calendar days across the daylight saving changes", () => {
    // 00:30 in Munich on consecutive days: 25 October 2026 has 25 hours and
    // 29 March 2026 has 23, yet each is one day.
    expect(
      munichDayNumber(new Date("2026-10-25T23:30:00Z")) -
        munichDayNumber(new Date("2026-10-24T22:30:00Z")),
    ).toBe(1);
    expect(
      munichDayNumber(new Date("2026-03-29T22:30:00Z")) -
        munichDayNumber(new Date("2026-03-28T23:30:00Z")),
    ).toBe(1);
  });

  test("turns over at Munich midnight", () => {
    const before = munichDayNumber(new Date("2026-09-27T21:59:59Z"));
    expect(munichDayNumber(new Date("2026-09-27T22:00:00Z"))).toBe(before + 1);
  });
});

describe("CMS dates", () => {
  test("convert between Sanity's ISO days and the site's form", () => {
    expect(munichDateFromIsoDay("2026-10-27")).toBe("27.10.2026");
    expect(isoDayFromMunichDate("27.10.2026")).toBe("2026-10-27");
  });

  test("reject days that are not on the calendar", () => {
    expect(munichDateFromIsoDay("2026-02-30")).toBeNull();
    expect(munichDateFromIsoDay("27.10.2026")).toBeNull();
    expect(() => isoDayFromMunichDate("31.04.2026")).toThrow();
    expect(() => isoDayFromMunichDate("2026-04-01")).toThrow();
  });

  test("the next day rolls over months and years", () => {
    expect(nextMunichDate("31.10.2026")).toBe("01.11.2026");
    expect(nextMunichDate("31.12.2026")).toBe("01.01.2027");
    expect(nextMunichDate("28.02.2028")).toBe("29.02.2028");
  });

  test("times are 24-hour HH:MM", () => {
    expect(isMunichTime("00:00")).toBe(true);
    expect(isMunichTime("23:59")).toBe(true);
    expect(isMunichTime("24:00")).toBe(false);
    expect(isMunichTime("9:30")).toBe(false);
  });
});
