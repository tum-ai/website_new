import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { fetchContent } from "@/lib/cms-content";
import type {
  PARTNER_CASE_STUDIES_QUERY_RESULT,
  PARTNERS_COPY_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import {
  buildPartnersBackfill,
  getPartnerCaseStudies,
  getPartnerProfiles,
  getPartnersCopy,
  PARTNER_CASE_STUDIES_QUERY,
  PARTNERS_COPY_QUERY,
} from "./content";
import {
  fillPartnerPillars,
  fillPartnerStats,
  partnerCaseStudies,
  partnerPillarTemplates,
  partnerPitch,
  partnerProfiles,
  partnerReasons,
  partnerStatTemplates,
} from "./data/partners";
import { partnershipFinderCopy } from "./data/partnership-finder";
import { buildOrganizationBackfill } from "./organization-content";

/**
 * Parity: the backfill documents, read back through the real GROQ queries
 * under the mock CMS, render exactly what the code renders. A second part
 * feeds crafted query results (`override`) to check how incomplete CMS
 * content falls back.
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

const codeCopy = {
  ...partnershipFinderCopy,
  pitch: partnerPitch,
  reasons: partnerReasons,
  stats: fillPartnerStats(partnerStatTemplates, contentTokens),
  pillars: fillPartnerPillars(partnerPillarTemplates, contentTokens),
};

const mockDocuments = () => [
  ...buildPartnersBackfill(),
  ...buildOrganizationBackfill(),
];

describe("the /partners content slice", () => {
  test("code source: the code copy, case studies and profiles", async () => {
    useSource("code");
    await expect(getPartnersCopy()).resolves.toStrictEqual(codeCopy);
    await expect(getPartnerCaseStudies()).resolves.toStrictEqual(
      partnerCaseStudies,
    );
    await expect(getPartnerProfiles()).resolves.toStrictEqual(partnerProfiles);
  });

  test("the mock serves the backfill through the real queries", async () => {
    useSource("sanity");
    const copy = await fetchContent<PARTNERS_COPY_QUERY_RESULT>({
      query: PARTNERS_COPY_QUERY,
      tags: [],
      mockDocuments,
      label: "parity",
    });
    expect(copy?.pillars).toHaveLength(partnerPillarTemplates.length);
    expect(copy?.intents?.talent?.label).toBe(
      partnershipFinderCopy.intents[0]?.label,
    );
    const studies = await fetchContent<PARTNER_CASE_STUDIES_QUERY_RESULT>({
      query: PARTNER_CASE_STUDIES_QUERY,
      tags: [],
      mockDocuments,
      label: "parity",
    });
    expect(studies?.map(({ name }) => name)).toStrictEqual(
      partnerCaseStudies.map(({ name }) => name),
    );
  });

  test("sanity source over the backfill: the same copy, case studies and profiles", async () => {
    useSource("sanity");
    await expect(getPartnersCopy()).resolves.toStrictEqual(codeCopy);
    await expect(getPartnerCaseStudies()).resolves.toStrictEqual(
      partnerCaseStudies,
    );
    await expect(getPartnerProfiles()).resolves.toStrictEqual(partnerProfiles);
  });

  test("the backfill keeps placeholders for facts, not their values", () => {
    const copy = buildPartnersBackfill().find(
      ({ _id }) => _id === "partnersCopy",
    );
    expect(JSON.stringify(copy)).toContain("{{org.officialMembers}}+");
    expect(JSON.stringify(copy)).toContain("{{community.makeathonSize}}+");
  });
});

describe("incomplete CMS copy", () => {
  test("empty fields keep the code copy; incomplete items are dropped", async () => {
    useSource("sanity");
    override.result = {
      pitch: null,
      intents: {
        talent: { label: "Hire from us", shortLabel: null, detail: null },
        hackathon: null,
        brand: null,
        research: null,
      },
      durations: { oneOff: null, ongoing: { label: "Year-round", detail: "" } },
      recommendations: null,
      reasons: [
        {
          icon: "network",
          name: "Reach",
          title: "Be seen.",
          description: "Everywhere.",
        },
        { icon: "rocket", name: "Speed", title: "Fast.", description: "Very." },
      ],
      stats: [
        { value: "{{org.officialMembers}}+", label: "Members", detail: null },
        { value: "{{org.unknown}}", label: "Broken", detail: null },
        { value: "5", label: "Detail broken", detail: "{{nope}}" },
      ],
      pillars: [
        {
          key: "venture",
          title: "Venture",
          metricLabel: "Raised",
          description: "{{eLab.completedCohorts}} cohorts.",
          image: {
            src: "https://cdn.sanity.io/x.webp",
            width: 1200,
            height: 800,
            alt: "Founders",
            hotspot: { x: 0.5, y: 0.25 },
          },
          href: "/e-lab",
        },
        {
          key: "space",
          title: "Space",
          metricLabel: "Rockets",
          description: "None.",
          image: null,
          href: "/space",
        },
      ],
    };

    const copy = await getPartnersCopy();
    expect(copy.pitch).toBe(partnerPitch);
    expect(copy.intents[0]).toStrictEqual({
      ...partnershipFinderCopy.intents[0],
      label: "Hire from us",
    });
    expect(copy.intents.slice(1)).toStrictEqual(
      partnershipFinderCopy.intents.slice(1),
    );
    expect(copy.durations[1]).toStrictEqual({
      ...partnershipFinderCopy.durations[1],
      label: "Year-round",
    });
    expect(copy.recommendations).toStrictEqual(
      partnershipFinderCopy.recommendations,
    );
    expect(copy.reasons).toStrictEqual([
      {
        icon: "network",
        name: "Reach",
        title: "Be seen.",
        description: "Everywhere.",
      },
    ]);
    expect(copy.stats).toStrictEqual([
      { value: `${contentTokens["org.officialMembers"]}+`, label: "Members" },
    ]);
    expect(copy.pillars).toStrictEqual([
      {
        key: "venture",
        title: "Venture",
        metric: codeCopy.pillars[1]?.metric,
        metricLabel: "Raised",
        description: `${contentTokens["eLab.completedCohorts"]} cohorts.`,
        image: {
          src: "https://cdn.sanity.io/x.webp",
          width: 1200,
          height: 800,
          alt: "Founders",
          objectPosition: "50% 25%",
        },
        href: "/e-lab",
      },
    ]);
  });

  test("no singleton yet: the code copy", async () => {
    useSource("sanity");
    override.result = null;
    await expect(getPartnersCopy()).resolves.toStrictEqual(codeCopy);
  });

  test("case studies keep their photo's hotspot and drop incomplete ones", async () => {
    useSource("sanity");
    override.result = [
      {
        organization: "quantco",
        name: "QuantCo",
        metric: "80%",
        label: "Hired",
        summary: "4 of 5 hired",
        copy: "Most of the team joined.",
        attribution: null,
        image: {
          src: "https://cdn.sanity.io/q.webp",
          width: 1600,
          height: 900,
          alt: "The team",
          hotspot: { x: 0.3, y: 0.6 },
        },
      },
      {
        organization: null,
        name: null,
        metric: "1",
        label: "Dangling",
        summary: "Its partner was deleted",
        copy: "…",
        attribution: null,
        image: null,
      },
    ];
    await expect(getPartnerCaseStudies()).resolves.toStrictEqual([
      {
        organization: "quantco",
        name: "QuantCo",
        metric: "80%",
        label: "Hired",
        summary: "4 of 5 hired",
        copy: "Most of the team joined.",
        image: "https://cdn.sanity.io/q.webp",
        alt: "The team",
        imagePosition: "30% 60%",
      },
    ]);
  });
});
