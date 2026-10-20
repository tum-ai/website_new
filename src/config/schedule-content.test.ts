import { evaluate, parse } from "groq-js";
import { afterEach, expect, test, vi } from "vitest";
import {
  settingsFixtureDocuments,
  settingsFixtureELabWindow,
  settingsFixtureMembership,
} from "@/lib/cms-fixtures/settings";
import {
  APPLICATION_WINDOW_QUERY,
  applicationWindowId,
  campaignsFromQuery,
  getCampaigns,
  getELabWindow,
  getMembershipWindow,
  selectELabWindow,
  selectMembershipWindow,
} from "./schedule-content";

afterEach(() => vi.unstubAllEnvs());
async function window(program: string) {
  const params = {
    program,
    id: applicationWindowId(program as "membership" | "e-lab"),
  };
  return (
    await evaluate(parse(APPLICATION_WINDOW_QUERY, { params }), {
      dataset: settingsFixtureDocuments,
      params,
    })
  ).get();
}
test("real GROQ yields complete application windows", async () => {
  expect(selectMembershipWindow(await window("membership"))).toEqual(
    settingsFixtureMembership,
  );
  expect(selectELabWindow(await window("e-lab"))).toEqual(
    settingsFixtureELabWindow,
  );
});
test("synthetic getters and optional empty campaigns", async () => {
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
  await expect(getMembershipWindow()).resolves.toEqual(
    settingsFixtureMembership,
  );
  await expect(getELabWindow()).resolves.toEqual(settingsFixtureELabWindow);
  await expect(getCampaigns()).resolves.toEqual([]);
});
test("missing windows, malformed deadlines, duplicate milestones fail", async () => {
  expect(() => selectMembershipWindow(null)).toThrow(/membership/);
  const value = await window("membership");
  value.deadlineTime = "25:00";
  expect(() => selectMembershipWindow(value)).toThrow(/deadlineTime/);
  const dup = await window("membership");
  dup.milestones.push(dup.milestones[0]);
  expect(() => selectMembershipWindow(dup)).toThrow(/exactly once/);
});
test("campaigns validate whole entries and preserve zero priority", () => {
  expect(campaignsFromQuery([])).toEqual([]);
  expect(
    campaignsFromQuery([
      {
        id: "campaign",
        name: "Campaign",
        startDate: "2026-10-01",
        priority: 0,
      },
    ]),
  ).toMatchObject([{ priority: 0, startDate: "01.10.2026" }]);
  expect(() =>
    campaignsFromQuery([
      { id: "campaign", name: "Campaign", startDate: "invalid" },
    ]),
  ).toThrow(/startDate/);
  expect(() =>
    campaignsFromQuery([
      {
        id: "campaign",
        name: "Campaign",
        startDate: "2026-10-01",
        headerCta: { variant: "notify" },
      },
    ]),
  ).toThrow(/notifyUrl/);
});

test.each([
  { endDate: "2026-09-30" },
  { endDate: "2026-10-01", startTime: "12:00", endTime: "12:00" },
])("invalid campaign range fails instead of disappearing", (range) => {
  expect(() =>
    campaignsFromQuery([
      { id: "c", name: "Campaign", startDate: "2026-10-01", ...range },
    ]),
  ).toThrow(/end after/);
});
