import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { fetchContent } from "@/lib/cms-content";
import { fillCodeCopy } from "@/lib/content-copy";
import type { HACKATHONS_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  buildHackathonsBackfill,
  getHackathonsCopy,
  HACKATHONS_COPY_QUERY,
} from "./content";
import { hackathonsCopyTemplate, hackathonsPageTokens } from "./data/copy";
import { makeathonEditions } from "./data/makeathon";

/**
 * Parity: the backfill document, read back through the real GROQ query
 * under the mock CMS, renders exactly what the code renders.
 */
/** Lets a test change the backfill documents the mock CMS serves. */
const tamper = vi.hoisted(() => ({
  edit: null as null | ((document: Record<string, unknown>) => unknown),
}));

vi.mock("@/lib/cms-content-mock", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/cms-content-mock")>();
  return {
    ...actual,
    evaluateMockQuery: (
      query: string,
      params: Record<string, unknown>,
      documents: readonly Record<string, unknown>[],
    ) =>
      actual.evaluateMockQuery(
        query,
        params,
        (tamper.edit ? documents.map(tamper.edit) : documents) as never,
      ),
  };
});

afterEach(() => {
  tamper.edit = null;
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const code = fillCodeCopy(
  hackathonsCopyTemplate,
  contentTokens,
  hackathonsPageTokens,
);

type Editions = { editions: Record<string, unknown>[] };

/** The backfill with its editions replaced by `edit(editions)`. */
const withEditions =
  (edit: (editions: Record<string, unknown>[]) => unknown[]) =>
  (document: Record<string, unknown>) => {
    if (document._id !== "hackathonsCopy") return document;
    const makeathon = document.makeathon as Editions;
    return {
      ...document,
      makeathon: { ...makeathon, editions: edit(makeathon.editions) },
    };
  };

describe("the /hackathons content slice", () => {
  test("code source: the code copy, page tokens left for the page", async () => {
    useSource("code");
    const copy = await getHackathonsCopy();
    expect(copy).toStrictEqual(code);
    expect(copy.hero.lead).toContain("{{count}}");
    expect(copy.hero.lead).not.toContain("{{impact.");
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const result = await fetchContent<HACKATHONS_COPY_QUERY_RESULT>({
      query: HACKATHONS_COPY_QUERY,
      tags: [],
      mockDocuments: buildHackathonsBackfill,
      label: "parity",
    });
    expect(result?.hero?.title).toBe(hackathonsCopyTemplate.hero.title);
    expect(result?.makeathon?.editions?.map(({ key }) => key)).toStrictEqual(
      makeathonEditions.map(({ key }) => key),
    );
  });

  test("sanity source over the backfill: the same copy", async () => {
    useSource("sanity");
    await expect(getHackathonsCopy()).resolves.toStrictEqual(code);
  });

  test("editors' editions replace the code list as a whole", async () => {
    useSource("sanity");
    tamper.edit = withEditions((editions) => editions.slice(-2));
    const copy = await getHackathonsCopy();
    expect(copy.makeathon.editions).toStrictEqual(makeathonEditions.slice(-2));
  });

  test.each([
    ["an end before its start", { end: "2020-01-01" }],
    ["a missing name", { name: null }],
    ["a date that is not a day", { start: "April 2021" }],
  ])("an edition with %s keeps the code editions", async (_, change) => {
    useSource("sanity");
    tamper.edit = withEditions(([first, ...rest]) => [
      { ...first, ...change },
      ...rest,
    ]);
    const copy = await getHackathonsCopy();
    expect(copy.makeathon.editions).toStrictEqual(code.makeathon.editions);
  });

  test("the backfill is one document with every edition keyed", () => {
    const documents = buildHackathonsBackfill();
    expect(documents).toHaveLength(1);
    const { editions } = documents[0].makeathon as {
      editions: { _key: string }[];
    };
    expect(editions.map(({ _key }) => _key)).toStrictEqual(
      makeathonEditions.map(({ key }) => key),
    );
  });
});
