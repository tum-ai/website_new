import { describe, expect, test } from "vitest";
import { leagueSummaryOf } from "./hackathons";

describe("leagueSummaryOf", () => {
  test("cities once each, in order of their first match", () => {
    expect(
      leagueSummaryOf([
        { city: "Munich" },
        { city: "Paris" },
        { city: "Munich" },
        { city: "Zurich" },
      ]),
    ).toStrictEqual({
      cities: ["Munich", "Paris", "Zurich"],
      citiesText: "Munich, Paris and Zurich",
      matchCount: 4,
    });
  });

  test("one city reads as itself", () => {
    expect(leagueSummaryOf([{ city: "Munich" }]).citiesText).toBe("Munich");
  });
});
