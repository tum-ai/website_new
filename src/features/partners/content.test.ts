import { afterEach, describe, expect, test, vi } from "vitest";
import { contentTokens } from "@/config/content-tokens";
import { siteFactsFallback } from "@/config/site-facts";
import { fetchContent } from "@/lib/cms-content";
import { fillCodeCopy } from "@/lib/content-copy";
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
  selectPillars,
} from "./content";
import {
  fillPartnerPillars,
  fillPartnerStats,
  partnerCaseStudies,
  partnerPillarMetricsOf,
  partnerPillarTemplates,
  partnerPitch,
  partnerProfiles,
  partnerReasons,
  partnerStatTemplates,
  partnersSections,
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
  recommendations: fillCodeCopy(
    partnershipFinderCopy.recommendations,
    contentTokens,
  ),
  pitch: partnerPitch,
  reasons: fillCodeCopy(partnerReasons, contentTokens),
  stats: fillPartnerStats(partnerStatTemplates, contentTokens),
  pillars: fillPartnerPillars(
    partnerPillarTemplates,
    contentTokens,
    partnerPillarMetricsOf(siteFactsFallback),
  ),
  sections: fillCodeCopy(partnersSections, contentTokens),
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
    expect(JSON.stringify(copy)).toContain("{{org.acceptanceRate}}%");
    expect(JSON.stringify(copy)).toContain("{{org.linkedinAudience}}+");
  });

  test("the acceptance rate and LinkedIn audience come from the site facts", async () => {
    useSource("code");
    const { acceptanceRate, linkedinAudience } = siteFactsFallback.organization;
    const rounded = `${Math.round(acceptanceRate)}%`;
    const audience = `${Math.floor(linkedinAudience / 1000)}k+`;
    const copy = await getPartnersCopy();
    expect(
      copy.stats.find(({ label }) => /acceptance rate/i.test(label))?.value,
    ).toBe(`${acceptanceRate}%`);
    expect(copy.reasons[0]?.title).toContain(`cracked ${rounded}`);
    expect(copy.sections.people.title).toContain(`cracked ${rounded}`);
    expect(copy.reasons[2]?.description).toContain(`${audience} LinkedIn`);
    expect(copy.recommendations.brand.description).toContain(
      `${audience} LinkedIn`,
    );
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
    expect(copy.recommendations).toStrictEqual(codeCopy.recommendations);
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

  test("section headings: edited lines show, blank lines drop, empty lists keep the code lines", async () => {
    useSource("sanity");
    override.result = {
      pitch: null,
      intents: null,
      durations: null,
      recommendations: null,
      reasons: null,
      stats: null,
      pillars: null,
      prompts: {
        intentQuestion: "What do you need?",
        durationQuestion: null,
        resultQuestion: null,
        firstChoice: null,
        bookingTitle: null,
        bookingLead: null,
        bookingSlow: null,
      },
      sections: {
        hero: {
          eyebrow: null,
          title: ["Meet", " ", "the builders"],
          lead: null,
          fitLabel: null,
          caption: ["", "  "],
        },
        marquee: null,
        finder: null,
        reasons: null,
        proof: { title: "Few get in." },
        pillars: null,
        people: null,
        directory: null,
        cases: null,
        contact: null,
      },
    };

    const copy = await getPartnersCopy();
    expect(copy.sections.hero).toStrictEqual({
      ...partnersSections.hero,
      title: ["Meet", "the builders"],
    });
    expect(copy.sections.proof.title).toBe("Few get in.");
    expect(copy.sections.contact).toStrictEqual(partnersSections.contact);
    expect(copy.sections.people).toStrictEqual(codeCopy.sections.people);
    expect(copy.prompts).toStrictEqual({
      ...partnershipFinderCopy.prompts,
      intentQuestion: "What do you need?",
    });
  });

  test("CMS reasons, formats and headings fill their placeholders; an unknown one drops that text", async () => {
    useSource("sanity");
    override.result = {
      recommendations: {
        brand: {
          name: null,
          description: "Reach our {{org.linkedinAudience}}+ followers.",
        },
        talent: { name: null, description: "Hire {{org.nope}} people." },
      },
      reasons: [
        {
          icon: "users",
          name: "Talent",
          title: "The top {{org.acceptanceRate}}%.",
          description: "Few get in.",
        },
        {
          icon: "network",
          name: "Reach",
          title: "Be seen.",
          description: "By {{org.nope}}.",
        },
      ],
      sections: {
        people: { title: "The cracked {{ org.acceptanceRateRounded }}%." },
      },
    };
    const copy = await getPartnersCopy();
    expect(copy.recommendations.brand.description).toBe(
      `Reach our ${contentTokens["org.linkedinAudience"]}+ followers.`,
    );
    expect(copy.recommendations.talent).toStrictEqual(
      codeCopy.recommendations.talent,
    );
    expect(copy.reasons).toStrictEqual([
      {
        icon: "users",
        name: "Talent",
        title: `The top ${contentTokens["org.acceptanceRate"]}%.`,
        description: "Few get in.",
      },
    ]);
    expect(copy.sections.people.title).toBe(
      `The cracked ${contentTokens["org.acceptanceRateRounded"]}%.`,
    );
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

describe("the pillar figures", () => {
  test("follow the render's site facts", () => {
    const facts = {
      ...siteFactsFallback,
      impact: { ...siteFactsFallback.impact, publications: 42 },
      eLab: { ...siteFactsFallback.eLab, ventureFundingMillions: 99 },
    };
    expect(partnerPillarMetricsOf(facts)).toMatchObject({
      research: "42+",
      venture: "99M",
    });
  });
});

test("a pillar links only to a page of this site", () => {
  const metrics = partnerPillarMetricsOf(siteFactsFallback);
  const [pillar] = partnerPillarTemplates;
  const image = {
    src: "https://cdn.sanity.io/images/p/d/a.jpg",
    width: 10,
    height: 10,
    alt: "",
    hotspot: null,
  };
  const pillars = selectPillars(
    ["/research", "//evil.example", "/\\evil.example", null].map((href) => ({
      ...pillar,
      image,
      href,
    })) as Parameters<typeof selectPillars>[0],
    contentTokens,
    metrics,
  );
  expect(pillars?.map(({ href }) => href)).toStrictEqual(["/research"]);
});
