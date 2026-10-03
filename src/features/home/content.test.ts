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
    expect(result?.join?.quotes?.map((quote) => quote.name)).toStrictEqual(
      homeCopyTemplate.join.quotes.map((quote) => quote.name),
    );
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

  test("the CMS quotes replace the code quotes, members and words together", () => {
    const { join } = merged({
      join: {
        quotes: [
          { name: "Ada Lovelace", excerpt: "CMS words" },
          { excerpt: "Words whose member did not resolve" },
          { name: "Grace Hopper" },
        ],
      },
    });
    expect(join.quotes).toStrictEqual([
      { name: "Ada Lovelace", excerpt: "CMS words" },
    ]);
  });

  test("words whose member did not resolve never go to a code member", () => {
    const { join } = merged({ join: { quotes: [{ excerpt: "CMS words" }] } });
    expect(join.quotes).toStrictEqual(code.copy.join.quotes);
  });

  test("a program links only to a page of this site", () => {
    const [first] = code.copy.programs.items;
    const { programs } = merged({
      programs: {
        items: [
          { ...first, id: "kept", href: "/research" },
          { ...first, id: "away", href: "//evil.example" },
          { ...first, id: "backslash", href: "/\\evil.example" },
        ],
      },
    });
    expect(programs.items.map(({ id }) => id)).toStrictEqual(["kept"]);
  });
});
