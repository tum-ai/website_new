import { describe, expect, test } from "vitest";
import {
  isMunichTime,
  isoDayFromMunichDate,
  munichDateFromIsoDay,
  munichDayNumber,
  munichIsoDate,
  munichMidnights,
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

  // 2026: summer time starts on 29 March (02:00 CET → 03:00 CEST, at
  // 01:00Z) and ends on 25 October (03:00 CEST → 02:00 CET, at 01:00Z).
  test.each([
    ["29.03.2026", "00:30", "2026-03-28T23:30:00.000Z"],
    ["29.03.2026", "01:30", "2026-03-29T00:30:00.000Z"],
    ["29.03.2026", "01:59", "2026-03-29T00:59:00.000Z"],
    ["29.03.2026", "03:00", "2026-03-29T01:00:00.000Z"],
    ["29.03.2026", "03:30", "2026-03-29T01:30:00.000Z"],
    ["29.03.2026", "23:59", "2026-03-29T21:59:00.000Z"],
  ])("the spring change day: %s %s is %s", (date, time, iso) => {
    expect(parseMunichDateTime(date, time).toISOString()).toBe(iso);
  });

  test("the hour the spring change skips lands after the gap", () => {
    // 02:00 to 02:59 never shows in Munich that night: read with winter
    // time, as far past 03:00 CEST as it is past 02:00.
    expect(parseMunichDateTime("29.03.2026", "02:00").toISOString()).toBe(
      "2026-03-29T01:00:00.000Z",
    );
    expect(parseMunichDateTime("29.03.2026", "02:30").toISOString()).toBe(
      "2026-03-29T01:30:00.000Z",
    );
    expect(munichIsoDate(parseMunichDateTime("29.03.2026", "02:59"))).toBe(
      "2026-03-29",
    );
  });

  test.each([
    ["25.10.2026", "00:30", "2026-10-24T22:30:00.000Z"],
    ["25.10.2026", "01:30", "2026-10-24T23:30:00.000Z"],
    ["25.10.2026", "01:59", "2026-10-24T23:59:00.000Z"],
    ["25.10.2026", "03:00", "2026-10-25T02:00:00.000Z"],
    ["25.10.2026", "23:59", "2026-10-25T22:59:00.000Z"],
  ])("the autumn change day: %s %s is %s", (date, time, iso) => {
    expect(parseMunichDateTime(date, time).toISOString()).toBe(iso);
  });

  test("the hour the autumn change repeats is its first, summer-time pass", () => {
    // 02:30 shows at 00:30Z (CEST) and again at 01:30Z (CET).
    expect(parseMunichDateTime("25.10.2026", "02:00").toISOString()).toBe(
      "2026-10-25T00:00:00.000Z",
    );
    expect(parseMunichDateTime("25.10.2026", "02:30").toISOString()).toBe(
      "2026-10-25T00:30:00.000Z",
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

describe("munichMidnights", () => {
  const iso = (from: string, to: string) =>
    munichMidnights(new Date(from), new Date(to)).map((midnight) =>
      midnight.toISOString(),
    );

  test("lists the midnights across the autumn change, 25 hours apart once", () => {
    // Summer time (UTC+2) until 25 October 2026, winter time (UTC+1) after.
    expect(iso("2026-10-23T12:00:00Z", "2026-10-27T12:00:00Z")).toEqual([
      "2026-10-23T22:00:00.000Z",
      "2026-10-24T22:00:00.000Z",
      "2026-10-25T23:00:00.000Z",
      "2026-10-26T23:00:00.000Z",
    ]);
  });

  test("lists the midnights across the spring change, 23 hours apart once", () => {
    expect(iso("2026-03-28T12:00:00Z", "2026-03-30T12:00:00Z")).toEqual([
      "2026-03-28T23:00:00.000Z",
      "2026-03-29T22:00:00.000Z",
    ]);
  });

  test("includes midnights on either end and nothing outside", () => {
    expect(iso("2026-09-27T22:00:00Z", "2026-09-28T22:00:00Z")).toEqual([
      "2026-09-27T22:00:00.000Z",
      "2026-09-28T22:00:00.000Z",
    ]);
    expect(iso("2026-09-27T22:00:01Z", "2026-09-28T21:59:59Z")).toEqual([]);
  });

  test("is empty for a reversed range", () => {
    expect(iso("2026-10-27T12:00:00Z", "2026-10-20T12:00:00Z")).toEqual([]);
  });

  test("gives each midnight as 00:00 on consecutive Munich days", () => {
    const midnights = munichMidnights(
      new Date("2026-09-27T12:00:00Z"),
      new Date("2026-11-17T12:00:00Z"),
    );
    expect(midnights).toHaveLength(51);
    midnights.forEach((midnight, index) => {
      expect(munichDayNumber(midnight)).toBe(
        munichDayNumber(midnights[0]) + index,
      );
      expect(munichDayNumber(new Date(midnight.getTime() - 1))).toBe(
        munichDayNumber(midnight) - 1,
      );
    });
  });
});
