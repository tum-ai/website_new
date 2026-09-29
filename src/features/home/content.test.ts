import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { departments } from "@/features/community";
import { buildMemberStoriesBackfill } from "@/features/community/server";
import { buildVentureBackfill } from "@/features/e-lab/server";
import { fetchContent } from "@/lib/cms-content";
import { mergeOverFallback } from "@/lib/cms-content-model";
import { fillCodeCopy } from "@/lib/content-copy";
import type { HOME_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  buildHomeBackfill,
  getHomeContent,
  HOME_COPY_QUERY,
  selectHomeCopy,
} from "./content";
import { homeCopyTemplate, homePageTokens } from "./data/homepage";

/**
 * Parity: the backfill document, read back through the real GROQ query
 * under the mock CMS, renders exactly what the code renders.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const code = {
  copy: fillCodeCopy(homeCopyTemplate, contentTokens, homePageTokens),
  departmentCount: departments.length,
};

describe("the homepage content slice", () => {
  test("code source: the code copy and department count", async () => {
    useSource("code");
    await expect(getHomeContent()).resolves.toStrictEqual(code);
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const result = await fetchContent<HOME_COPY_QUERY_RESULT>({
      query: HOME_COPY_QUERY,
      tags: [],
      mockDocuments: buildHomeBackfill,
      label: "parity",
    });
    expect(result?.room?.photos).toHaveLength(
      homeCopyTemplate.room.photos.length,
    );
    expect(result?.programs?.items?.map(({ id }) => id)).toStrictEqual(
      homeCopyTemplate.programs.items.map(({ id }) => id),
    );
  });

  test("the quotes resolve their person references", async () => {
    useSource("sanity");
    const result = await fetchContent<HOME_COPY_QUERY_RESULT>({
      query: HOME_COPY_QUERY,
      tags: [],
      mockDocuments: () => [
        ...buildHomeBackfill(),
        ...buildMemberStoriesBackfill(),
        ...buildVentureBackfill(),
      ],
      label: "parity",
    });
    expect(result?.join?.quote?.name).toBe(homeCopyTemplate.join.quote.name);
    expect(result?.partners?.quote).toBe(homeCopyTemplate.partners.quote);
  });

  test("sanity source over the backfill: the same copy and count", async () => {
    useSource("sanity");
    await expect(getHomeContent()).resolves.toStrictEqual(code);
  });

  test("the backfill holds one homeCopy document", () => {
    expect(buildHomeBackfill().map(({ _id }) => _id)).toStrictEqual([
      "homeCopy",
    ]);
  });
});

describe("CMS copy over the code copy", () => {
  const merged = (copy: Parameters<typeof selectHomeCopy>[0]) =>
    mergeOverFallback(code.copy, selectHomeCopy(copy));

  test("the join quote takes the CMS member and words together", () => {
    const { join } = merged({
      join: { quote: { name: "Ada Lovelace", excerpt: "CMS words" } },
    });
    expect(join.quote).toStrictEqual({
      name: "Ada Lovelace",
      excerpt: "CMS words",
    });
  });

  test("words whose member did not resolve never go to the code member", () => {
    const { join } = merged({ join: { quote: { excerpt: "CMS words" } } });
    expect(join.quote).toStrictEqual(code.copy.join.quote);
  });
});
