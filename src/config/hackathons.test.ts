import { describe, expect, test } from "vitest";
import { hackathonFacts, leagueSummaryOf } from "./hackathons";

const { league } = hackathonFacts;
const isDay = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

describe("the league season", () => {
  test("matches are calendar days in order, each ending on or after its start", () => {
    for (const match of league.matches) {
      expect(isDay(match.start), match.key).toBe(true);
      expect(isDay(match.end), match.key).toBe(true);
      expect(match.end >= match.start, match.key).toBe(true);
    }
    const starts = league.matches.map(({ start }) => start);
    expect(starts).toStrictEqual([...starts].sort());
  });

  test("keys are unique, and exactly one match is a Makeathon", () => {
    const keys = league.matches.map(({ key }) => key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(
      league.matches.filter((match) => "makeathon" in match && match.makeathon),
    ).toHaveLength(1);
  });

  test("the league was founded in the year of its first match", () => {
    expect(league.matches[0].start.slice(0, 4)).toBe(
      String(league.foundedYear),
    );
  });

  test("the Grand Finale takes a positive whole number of teams", () => {
    expect(Number.isInteger(league.finaleTeams)).toBe(true);
    expect(league.finaleTeams).toBeGreaterThan(0);
  });

  test("partners are unique organisation keys", () => {
    expect(new Set(league.partners).size).toBe(league.partners.length);
    for (const key of league.partners) expect(key).toMatch(/^[a-z0-9-]+$/);
  });

  test("links are https", () => {
    expect(new URL(league.url).protocol).toBe("https:");
    expect(new URL(hackathonFacts.makeathonUrl).protocol).toBe("https:");
  });
});

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
