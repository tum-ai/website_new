import { describe, expect, test } from "vitest";
import {
  munichDayNumber,
  munichIsoDate,
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
