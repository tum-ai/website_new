import { afterEach, describe, expect, test, vi } from "vitest";
import { buildOrganizationBackfill } from "@/features/partners";
import { fetchContent } from "@/lib/cms-content";
import { PEOPLE_QUERY } from "@/lib/person-content";
import type { PEOPLE_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  eLabVoices,
  notableStartups,
  testimonialCards,
  tracedVenture,
} from "./data/venture-page";
import {
  buildVentureBackfill,
  getNotableStartups,
  getTestimonialCards,
  getTracedVenture,
} from "./venture-content";

/**
 * Parity for the /e-lab venture slice: ventures, testimonials and the traced
 * venture, read back from the backfill through the real queries under the
 * mock CMS, are exactly the code content. The second part feeds crafted
 * query results (`override`) to check the fallbacks.
 */
const override = vi.hoisted(() => ({ result: undefined as unknown }));

vi.mock("@/lib/cms-content-mock", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/cms-content-mock")>();
  return {
    ...actual,
    evaluateMockQuery: (
      ...args: Parameters<typeof actual.evaluateMockQuery>
    ) =>
      override.result === undefined
        ? actual.evaluateMockQuery(...args)
        : override.result,
  };
});

afterEach(() => {
  vi.unstubAllEnvs();
  override.result = undefined;
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

describe("the /e-lab venture slice", () => {
  test("code source: the code ventures, testimonials and trace", async () => {
    useSource("code");
    await expect(getNotableStartups()).resolves.toStrictEqual(notableStartups);
    await expect(getTestimonialCards()).resolves.toStrictEqual(
      testimonialCards,
    );
    await expect(getTracedVenture()).resolves.toStrictEqual(tracedVenture);
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const people = await fetchContent<PEOPLE_QUERY_RESULT>({
      query: PEOPLE_QUERY,
      params: { placement: "e-lab-testimonial" },
      tags: [],
      mockDocuments: () => [
        ...buildVentureBackfill(),
        ...buildOrganizationBackfill(),
      ],
      label: "parity",
    });
    expect(people?.map(({ key }) => key)).toStrictEqual(
      testimonialCards.map(({ id }) => id),
    );
  });

  test("sanity source over the backfill: the same ventures, testimonials and trace", async () => {
    useSource("sanity");
    await expect(getNotableStartups()).resolves.toStrictEqual(notableStartups);
    await expect(getTestimonialCards()).resolves.toStrictEqual(
      testimonialCards,
    );
    await expect(getTracedVenture()).resolves.toStrictEqual(tracedVenture);
  });

  test("the ids code picks people by resolve in the CMS content", async () => {
    useSource("sanity");
    const ids = new Set((await getTestimonialCards()).map(({ id }) => id));
    for (const id of [...eLabVoices.founders, ...eLabVoices.investors]) {
      expect(ids, id).toContain(id);
    }
    const trace = await getTracedVenture();
    expect(ids).toContain(trace.testimonialId);
    expect((await getNotableStartups()).map(({ id }) => id)).toContain(
      trace.startupId,
    );
  });
});

describe("incomplete CMS content", () => {
  test("a testimonial without its organisation's logo is skipped", async () => {
    useSource("sanity");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    override.result = [
      {
        key: "ada",
        name: "Ada",
        role: "Founder",
        context: null,
        quote: "Great.",
        story: null,
        portrait: {
          src: "/p.webp",
          width: 1,
          height: 1,
          alt: null,
          hotspot: null,
        },
        organization: { key: "engines", name: "Engines", logo: null },
      },
    ];
    await expect(getTestimonialCards()).resolves.toStrictEqual(
      testimonialCards,
    );
    expect(console.warn).toHaveBeenCalled();
  });

  test("the trace keeps code for empty fields and drops incomplete milestones", async () => {
    useSource("sanity");
    override.result = {
      startupId: null,
      testimonialId: "leon-hergert",
      cohort: "E-Lab 2.0",
      now: null,
      after: [
        { text: "Seed round", source: "https://example.com/" },
        { text: null, source: "https://example.com/" },
      ],
    };
    await expect(getTracedVenture()).resolves.toStrictEqual({
      ...tracedVenture,
      cohort: "E-Lab 2.0",
      after: [{ text: "Seed round", source: "https://example.com/" }],
    });
  });
});
