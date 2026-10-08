import { describe, expect, test } from "vitest";
import {
  hackathonsFactsFixture,
  hackathonsFixture,
} from "@/lib/cms-fixtures/hackathons";
import { hackathonsView } from "./hackathons-view";

const now = new Date("2026-10-01T12:00:00Z");
const view = () =>
  hackathonsView({
    copy: hackathonsFixture,
    facts: hackathonsFactsFixture,
    logos: [],
    events: [],
    now,
  });

describe("CMS inputs to the hackathons view", () => {
  test("league logos are the explicitly fetched list, including an empty list", () => {
    expect(view().league.partners).toEqual([]);
    const logos = [
      {
        name: "Example league partner",
        src: "https://example.com/logo.svg",
        aspect: 3,
        href: "https://example.com/partner",
      },
    ];
    expect(
      hackathonsView({
        copy: hackathonsFixture,
        facts: hackathonsFactsFixture,
        logos,
        events: [],
        now,
      }).league.partners,
    ).toBe(logos);
  });
  test("changed CMS league dates, city, name and URLs reach every view", () => {
    const facts = {
      ...hackathonsFactsFixture,
      makeathonUrl: "https://example.com/edited-makeathon",
      league: {
        ...hackathonsFactsFixture.league,
        name: "Edited league",
        url: "https://example.com/edited-league",
        matches: [
          {
            key: "finale",
            label: "Finale",
            city: "Example city",
            start: "2026-11-10",
            end: "2026-11-11",
          },
        ],
      },
    };
    const changed = hackathonsView({
      copy: hackathonsFixture,
      facts,
      logos: [],
      events: [],
      now,
    });
    expect(changed.hero).toMatchObject({
      leagueUrl: facts.league.url,
      makeathonUrl: facts.makeathonUrl,
    });
    expect(changed.makeathon.url).toBe(facts.makeathonUrl);
    expect(changed.league).toMatchObject({
      name: "Edited league",
      url: facts.league.url,
      finale: {
        city: "Example city",
        dateTime: "2026-11-10",
        countdown: "In 40 days",
      },
    });
    expect(changed.league.season).toHaveLength(1);
    expect(changed.league.dates[0]).toMatchObject({
      dateTime: "2026-11-10",
      label: "Finale, Example city",
    });
    expect(changed.hero.ribbon.entries.at(-1)).toMatchObject({
      id: "league-finale",
      title: "Edited league, Finale",
    });
  });
});
