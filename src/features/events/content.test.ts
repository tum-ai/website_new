import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { fetchContent } from "@/lib/cms-content";
import { fillCodeCopy } from "@/lib/content-copy";
import type { EVENTS_COPY_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  buildEventsBackfill,
  EVENTS_COPY_QUERY,
  getEventsCopy,
} from "./content";
import { eventsCopyTemplate, eventsPageTokens } from "./data/copy";

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

const code = fillCodeCopy(eventsCopyTemplate, contentTokens, eventsPageTokens);

describe("the /events content slice", () => {
  test("code source: the code copy", async () => {
    useSource("code");
    await expect(getEventsCopy()).resolves.toStrictEqual(code);
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const result = await fetchContent<EVENTS_COPY_QUERY_RESULT>({
      query: EVENTS_COPY_QUERY,
      tags: [],
      mockDocuments: buildEventsBackfill,
      label: "parity",
    });
    expect(result?.closing?.title).toBe(eventsCopyTemplate.closing.title);
  });

  test("sanity source over the backfill: the same copy", async () => {
    useSource("sanity");
    await expect(getEventsCopy()).resolves.toStrictEqual(code);
  });
});
