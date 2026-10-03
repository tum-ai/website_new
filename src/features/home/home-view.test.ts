import { afterAll, beforeAll, expect, test, vi } from "vitest";
import { settingsFixtureFacts } from "@/lib/cms-fixtures/settings";
import { getHomeContent } from "./content";
import type { HomeCopy } from "./data/homepage";
import { homeView } from "./home-view";

let copy: HomeCopy;
beforeAll(async () => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
  copy = (await getHomeContent()).copy;
});
afterAll(() => vi.unstubAllEnvs());
const sources = {
  facts: settingsFixtureFacts,
  departmentCount: 2,
  rexInstitutions: [{ shortName: "Example Lab" }],
};
test("ledger labels come from copy and figures from CMS settings", () => {
  const { ledger } = homeView(copy, sources);
  expect(ledger.map(({ label }) => label)).toEqual(
    copy.ledger.map(({ label }) => label),
  );
  expect(ledger.find(({ label }) => label === "Members")).toMatchObject({
    value: 30,
    suffix: "+",
  });
});
test("program descriptions derive department and institution labels", () => {
  const { programs } = homeView(copy, sources);
  expect(programs[0]?.description).toBe(
    "Members work in two teams with Example Lab.",
  );
  expect(programs[0]?.image).toEqual({ src: "/assets/fixtures/photo.svg" });
});
test("the funding ledger preserves fact precision", () => {
  const funding = (value: number) =>
    homeView(copy, {
      ...sources,
      facts: {
        ...sources.facts,
        eLab: { ...sources.facts.eLab, ventureFundingMillions: value },
      },
    }).ledger.find(({ label }) => label === "Funding");
  expect(funding(7.5)).toMatchObject({ value: 7.5, prefix: "€", decimals: 1 });
  expect(funding(12)).toMatchObject({ value: 12, prefix: "€", decimals: 0 });
});
