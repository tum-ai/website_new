import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { fetchContent } from "@/lib/cms-content";
import { fillCodeCopy } from "@/lib/content-copy";
import type {
  LAB_SITES_QUERY_RESULT,
  RESEARCH_COPY_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import {
  buildResearchBackfill,
  getLabSiteList,
  getResearchCopy,
  LAB_SITES_QUERY,
  RESEARCH_COPY_QUERY,
} from "./content";
import { labSites } from "./data/lab-sites";
import { researchCopyTemplate, researchPageTokens } from "./data/research-copy";

const researchCopy = fillCodeCopy(
  researchCopyTemplate,
  contentTokens,
  researchPageTokens,
);

/**
 * Parity: the backfill documents, read back through the real GROQ queries
 * under the mock CMS, render exactly what the code renders.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const fetchBackfill = <T>(query: string) =>
  fetchContent<T>({
    query,
    tags: [],
    mockDocuments: buildResearchBackfill,
    label: "parity",
  });

describe("the /research content slice", () => {
  test("code source: the code copy and lab sites", async () => {
    useSource("code");
    await expect(getResearchCopy()).resolves.toStrictEqual(researchCopy);
    await expect(getLabSiteList()).resolves.toStrictEqual(labSites);
  });

  test("the mock serves the backfill through the real queries", async () => {
    useSource("sanity");
    const copy =
      await fetchBackfill<RESEARCH_COPY_QUERY_RESULT>(RESEARCH_COPY_QUERY);
    expect(copy?.figurePanels).toHaveLength(researchCopy.figurePanels.length);
    const sites = await fetchBackfill<LAB_SITES_QUERY_RESULT>(LAB_SITES_QUERY);
    expect(sites?.map(({ id }) => id)).toStrictEqual(
      labSites.map(({ id }) => id),
    );
  });

  test("sanity source over the backfill: the same copy and lab sites", async () => {
    useSource("sanity");
    await expect(getResearchCopy()).resolves.toStrictEqual(researchCopy);
    await expect(getLabSiteList()).resolves.toStrictEqual(labSites);
  });

  test("the backfill holds the copy and one document per lab site", () => {
    const documents = buildResearchBackfill();
    expect(
      documents.filter(({ _type }) => _type === "researchCopy"),
    ).toHaveLength(1);
    expect(documents.filter(({ _type }) => _type === "labSite")).toHaveLength(
      labSites.length,
    );
  });
});
