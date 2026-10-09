import { afterEach, expect, test, vi } from "vitest";
import {
  settingsFixtureELabWindow,
  settingsFixtureFacts,
  settingsFixtureMembership,
} from "@/lib/cms-fixtures/settings";
import { contentTokenNames } from "@/lib/content-tokens";
import { contentTokensFor, getContentTokens } from "./content-tokens";

const sources = {
  facts: settingsFixtureFacts,
  membership: settingsFixtureMembership,
  eLab: settingsFixtureELabWindow,
  rexInstitutions: ["Example Company"],
};
afterEach(() => vi.unstubAllEnvs());
test("every token derives from resolved CMS facts", () => {
  const tokens = contentTokensFor(sources);
  expect(Object.keys(tokens).sort()).toEqual([...contentTokenNames].sort());
  expect(tokens["org.activeMembers"]).toBe(
    String(sources.facts.organization.activeMembers),
  );
  expect(tokens["league.matchCount"]).toBe("1");
  expect(tokens["league.foundedYear"]).toBe(
    String(sources.facts.hackathons.league.foundedYear),
  );
});
test("getter combines same synthetic CMS facts and windows", async () => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
  await expect(getContentTokens()).resolves.toEqual(contentTokensFor(sources));
});
test("changed facts and windows propagate without copy fallback", () => {
  const tokens = contentTokensFor({
    ...sources,
    facts: {
      ...sources.facts,
      organization: { ...sources.facts.organization, alumni: 100 },
      hackathons: {
        ...sources.facts.hackathons,
        league: { ...sources.facts.hackathons.league, finaleTeams: 12 },
      },
    },
  });
  expect(tokens["org.officialMembers"]).toBe("112");
  expect(tokens["league.finaleTeams"]).toBe("12");
});
test("funding and large counts read the same in every sentence and stat", () => {
  const tokens = contentTokensFor({
    ...sources,
    facts: {
      ...sources.facts,
      organization: {
        ...sources.facts.organization,
        activeMembers: 150,
        alumni: 850,
        startedApplicationsPerBatch: 2100,
      },
      eLab: { ...sources.facts.eLab, ventureFundingMillions: 7.5 },
    },
  });
  expect(tokens["eLab.ventureFunding"]).toBe("€7.5M+");
  expect(tokens["eLab.admittedTeams"]).toBe(
    String(sources.facts.eLab.selection.admitted),
  );
  expect(tokens["org.officialMembers"]).toBe("1,000");
  expect(tokens["org.startedApplications"]).toBe("2,100");
});

test("lists read the same on every page: the REX schools and the league cities", () => {
  const tokens = contentTokensFor({
    ...sources,
    rexInstitutions: ["Harvard", "MIT", "Inria"],
  });
  expect(tokens.rexInstitutions).toBe("Harvard, MIT and Inria");
  expect(tokens.rexInstitutionsOr).toBe("Harvard, MIT or Inria");
  expect(tokens["league.citiesOr"]).toBe(tokens["league.cities"]);
});
