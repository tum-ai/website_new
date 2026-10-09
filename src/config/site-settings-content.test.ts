import { evaluate, parse } from "groq-js";
import { afterEach, expect, test, vi } from "vitest";
import { programmesFixtureDocuments } from "@/lib/cms-fixtures/programmes";
import {
  settingsFixtureDocuments,
  settingsFixtureFacts,
} from "@/lib/cms-fixtures/settings";
import {
  getSiteFacts,
  SITE_SETTINGS_QUERY,
  selectSiteFacts,
} from "./site-settings-content";

afterEach(() => vi.unstubAllEnvs());
async function result() {
  return (
    await evaluate(parse(SITE_SETTINGS_QUERY), {
      // eLabCopy too: the program length is the sum of its phases.
      dataset: [...settingsFixtureDocuments, ...programmesFixtureDocuments],
    })
  ).get();
}
test("real GROQ resolves independent settings and event references", async () => {
  expect(selectSiteFacts(await result())).toEqual(settingsFixtureFacts);
});
test("local getter uses synthetic documents", async () => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
  await expect(getSiteFacts()).resolves.toEqual(settingsFixtureFacts);
});
test.each([null, {}, { organization: { activeMembers: 10 } }])(
  "incomplete settings cannot render",
  (value) => {
    expect(() => selectSiteFacts(value)).toThrow(/siteSettings/);
  },
);
test("invalid settings fail with exact fields", async () => {
  const value = await result();
  value.contactEmails.general = "broken";
  expect(() => selectSiteFacts(value)).toThrow(/contactEmails.general/);
});
test("widening funnel and broken event refs fail", async () => {
  const value = await result();
  value.eLab.selection.admitted = 1000;
  expect(() => selectSiteFacts(value)).toThrow(/selection/);
  const missing = await result();
  missing.hackathons.league.matches[0].city = null;
  expect(() => selectSiteFacts(missing)).toThrow(/matches\[0\].city/);
});
test("required footer tagline cannot be blank", async () => {
  const value = await result();
  value.footerTagline = "";
  expect(() => selectSiteFacts(value)).toThrow(/footerTagline/);
});

test("match days use Munich time, with one-day events ending at their start", async () => {
  const docs = structuredClone([
    ...settingsFixtureDocuments,
    ...programmesFixtureDocuments,
  ]);
  const match = docs.find((doc) => doc._id === "settings-fixture-match");
  if (!match) throw new Error("missing fixture");
  match.event_date = "2026-09-27T22:30:00Z";
  delete match.end_date;
  const value = await evaluate(parse(SITE_SETTINGS_QUERY), { dataset: docs });
  expect(
    selectSiteFacts(await value.get()).hackathons.league.matches[0],
  ).toMatchObject({ start: "2026-09-28", end: "2026-09-28" });
});
