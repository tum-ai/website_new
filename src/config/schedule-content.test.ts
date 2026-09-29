import { afterEach, describe, expect, test, vi } from "vitest";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { fetchContent } from "@/lib/cms-content";
import type {
  APPLICATION_WINDOW_QUERY_RESULT,
  CAMPAIGNS_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import { campaignsFallback } from "./campaigns";
import { eLabWindowFallback } from "./e-lab";
import { membershipConfig } from "./membership";
import {
  APPLICATION_WINDOW_QUERY,
  applicationWindowId,
  buildScheduleBackfill,
  CAMPAIGNS_QUERY,
  campaignsFromQuery,
  getCampaigns,
  getELabWindow,
  getFeaturedEventId,
  getMembershipWindow,
} from "./schedule-content";

/**
 * Parity: the backfilled application windows, read back through the real
 * GROQ query under the mock CMS, equal the code config. Campaigns have no
 * code content, so their query and mapping are checked over sample
 * documents instead.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

describe("the application windows", () => {
  test("code source: the config windows", async () => {
    useSource("code");
    await expect(getMembershipWindow()).resolves.toStrictEqual(
      membershipConfig,
    );
    await expect(getELabWindow()).resolves.toStrictEqual(eLabWindowFallback);
  });

  test("the mock serves one window per program through the real query", async () => {
    useSource("sanity");
    for (const program of ["membership", "e-lab"]) {
      const result = await fetchContent<APPLICATION_WINDOW_QUERY_RESULT>({
        query: APPLICATION_WINDOW_QUERY,
        params: { program },
        tags: [],
        mockDocuments: buildScheduleBackfill,
        label: "parity",
      });
      expect(result?.deadlineTime, program).toMatch(/^\d{2}:\d{2}$/);
    }
  });

  test("sanity source over the backfill: the same windows", async () => {
    useSource("sanity");
    await expect(getMembershipWindow()).resolves.toStrictEqual(
      membershipConfig,
    );
    await expect(getELabWindow()).resolves.toStrictEqual(eLabWindowFallback);
  });

  test("the backfill holds each program's pinned window", () => {
    expect(
      buildScheduleBackfill().map(({ _id, program }) => [_id, program]),
    ).toStrictEqual([
      [applicationWindowId("membership"), "membership"],
      [applicationWindowId("e-lab"), "e-lab"],
    ]);
  });
});

/** Sample campaign documents as the Studio stores them. */
const campaignDocuments: BackfillDocument[] = [
  {
    _id: "campaign-elab",
    _type: "campaign",
    name: "E-Lab applications",
    startDate: "2026-08-01",
    endDate: "2026-09-27",
    endTime: "22:00",
    headerCta: { variant: "elab", yieldsToRecruiting: false },
  },
  {
    _id: "campaign-event",
    _type: "campaign",
    name: "Makeathon",
    startDate: "2026-10-01",
    startTime: "09:00",
    headerCta: {
      variant: "notify",
      label: "  Get the date  ",
      notifyUrl: "https://example.com/signup",
    },
    featuredEventId: "event-makeathon",
  },
  {
    _id: "campaign-broken",
    _type: "campaign",
    name: "Typo",
    startDate: "2026-10-01",
    startTime: "9:00",
  },
];

describe("the campaigns", () => {
  test("code source: none", async () => {
    useSource("code");
    await expect(getCampaigns()).resolves.toBe(campaignsFallback);
    await expect(getFeaturedEventId(new Date())).resolves.toBeNull();
  });

  test("sanity source over the (empty) backfill: none", async () => {
    useSource("sanity");
    await expect(getCampaigns()).resolves.toStrictEqual([]);
  });

  test("the query and mapping turn documents into code campaigns", async () => {
    useSource("sanity");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await fetchContent<CAMPAIGNS_QUERY_RESULT>({
      query: CAMPAIGNS_QUERY,
      tags: [],
      mockDocuments: () => campaignDocuments,
      label: "campaigns",
    });
    if (!result) throw new Error("expected campaigns");
    expect(campaignsFromQuery(result)).toStrictEqual([
      {
        id: "campaign-event",
        name: "Makeathon",
        startDate: "01.10.2026",
        startTime: "09:00",
        headerCta: {
          variant: "notify",
          label: "Get the date",
          notifyUrl: "https://example.com/signup",
          yieldsToRecruiting: true,
        },
        featuredEventId: "event-makeathon",
      },
      {
        id: "campaign-elab",
        name: "E-Lab applications",
        startDate: "01.08.2026",
        endDate: "27.09.2026",
        endTime: "22:00",
        headerCta: { variant: "elab", yieldsToRecruiting: false },
      },
    ]);
    expect(console.warn).toHaveBeenCalledOnce();
    vi.restoreAllMocks();
  });
});
