import { describe, expect, test } from "vitest";
import { yearsSinceFounding } from "./community";

const organizationFacts = { foundingYear: 2020 };

describe("yearsSinceFounding", () => {
  const { foundingYear } = organizationFacts;

  test("counts whole calendar years since the founding year", () => {
    expect(
      yearsSinceFounding(new Date("2026-10-01T12:00:00Z"), foundingYear),
    ).toBe(2026 - foundingYear);
  });

  test("uses the Munich calendar year at the turn of the year", () => {
    // 23:30 UTC on New Year's Eve is already 00:30 on 1 January in Munich.
    expect(
      yearsSinceFounding(new Date("2026-12-31T23:30:00Z"), foundingYear),
    ).toBe(2027 - foundingYear);
    expect(
      yearsSinceFounding(new Date("2026-12-31T22:30:00Z"), foundingYear),
    ).toBe(2026 - foundingYear);
  });
});
