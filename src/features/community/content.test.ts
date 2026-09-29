import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { fetchContent } from "@/lib/cms-content";
import { DEPARTMENTS_QUERY, JOURNEY_QUERY } from "@/lib/community-content";
import { fillCodeCopy } from "@/lib/content-copy";
import type {
  COMMUNITY_COPY_QUERY_RESULT,
  DEPARTMENTS_QUERY_RESULT,
  JOURNEY_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import {
  buildCommunityBackfill,
  COMMUNITY_COPY_QUERY,
  getCommunityContent,
} from "./content";
import { communityCopyTemplate } from "./data/copy";
import { departments } from "./data/departments";
import { journeySteps, memberJourney } from "./data/member-journey";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const code = {
  copy: fillCodeCopy(communityCopyTemplate, contentTokens),
  journey: memberJourney,
  departments: fillCodeCopy([...departments], contentTokens),
};

const fetchBackfill = <T>(query: string) =>
  fetchContent<T>({
    query,
    tags: [],
    mockDocuments: buildCommunityBackfill,
    label: "parity",
  });

describe("the /community content slice", () => {
  test("code source: the code copy, journey and departments", async () => {
    useSource("code");
    await expect(getCommunityContent()).resolves.toStrictEqual(code);
  });

  test("the mock serves the backfill through the real queries", async () => {
    useSource("sanity");
    const copy =
      await fetchBackfill<COMMUNITY_COPY_QUERY_RESULT>(COMMUNITY_COPY_QUERY);
    expect(copy?.hero?.photo?.src).toBe(communityCopyTemplate.hero.photo.src);
    const steps = await fetchBackfill<JOURNEY_QUERY_RESULT>(JOURNEY_QUERY);
    expect(steps?.map(({ step }) => step)).toStrictEqual(
      journeySteps.map(({ step }) => step),
    );
    const teams =
      await fetchBackfill<DEPARTMENTS_QUERY_RESULT>(DEPARTMENTS_QUERY);
    expect(teams).toHaveLength(departments.length);
  });

  test("sanity source over the backfill: the same copy, journey and departments", async () => {
    useSource("sanity");
    await expect(getCommunityContent()).resolves.toStrictEqual(code);
  });

  test("the backfill holds the copy, one step per journey step and one document per department", () => {
    const documents = buildCommunityBackfill();
    const count = (type: string) =>
      documents.filter(({ _type }) => _type === type).length;
    expect(count("communityCopy")).toBe(1);
    expect(count("journeyStep")).toBe(journeySteps.length);
    expect(count("department")).toBe(departments.length);
  });
});
