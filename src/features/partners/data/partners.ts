import type { SiteFacts } from "@/config/site-facts";
import type { ContentImage } from "@/lib/cms-content-model";
import { type ContentTokens, fillCodeTemplate } from "@/lib/content-tokens";
import type { PartnershipFinderCopy } from "./partnership-finder";

/**
 * The /partners copy: the code source of the CMS `partnersCopy` singleton,
 * `caseStudy` and the partner-profile `person` documents
 * (`features/partners/content.ts`). Figures that are site facts are
 * `{{placeholders}}` (`lib/content-tokens.ts`) or derived from the config.
 * The slice fills placeholders per render with `getContentTokens()`; this
 * module never imports the token values, which are server-only.
 */

/** The icon beside a reason, mapped to a Lucide icon by the section. */
export type PartnerReasonIcon = "users" | "briefcase" | "network";

/** A reason to partner: an icon, a label, a title and a paragraph. */
export type PartnerReason = {
  icon: PartnerReasonIcon;
  name: string;
  title: string;
  description: string;
};

export const partnerReasons: readonly PartnerReason[] = [
  {
    icon: "users",
    name: "Talent",
    title: "Hire the cracked 2%.",
    description:
      "Curated talent profiles in your dedicated Partner Dashboard, plus access to the TUM.ai Jobboard. Find your next senior engineer or technical co-founder before anyone else.",
  },
  {
    icon: "briefcase",
    name: "Decision Makers",
    title: "Direct access to future founders & leaders.",
    description:
      "Host exclusive company visits, workshops and co-organized events. Get in front of the people who'll be deciding tool budgets in three years in the fastest-growing industries in Europe.",
  },
  {
    icon: "network",
    name: "Network & Exposure",
    title: "Your brand, inside the room where AI is built.",
    description:
      "Your brand in front of a 20k+ LinkedIn audience, our newsletter and the major events we run. Consistent visibility across the community where Europe's next AI companies are being built.",
  },
];

/** A proof figure on violet; `value` counts up to its exact text. */
export type PartnerStat = { value: string; label: string; detail?: string };

/** The proof figures as templates: facts from the config are placeholders. */
export const partnerStatTemplates: readonly PartnerStat[] = [
  { value: "2100+", label: "Started applications per batch" },
  { value: "2.3%", label: "Acceptance rate per batch" },
  {
    value: "{{org.officialMembers}}+",
    label: "Official members",
    detail: "{{org.activeMembers}} active, {{org.alumni}} alumni",
  },
  {
    value: "1.2M+",
    label: "LinkedIn impressions (last 12 months)",
    detail: "30%+ engagement",
  },
];

/** Stat templates with their placeholders filled. */
export function fillPartnerStats(
  templates: readonly PartnerStat[],
  tokens: ContentTokens,
): PartnerStat[] {
  return templates.map(({ value, label, detail }) => ({
    value: fillCodeTemplate(value, tokens),
    label,
    ...(detail === undefined
      ? {}
      : { detail: fillCodeTemplate(detail, tokens) }),
  }));
}

/** Which pillar a card is; it picks the card's figure. */
export type PartnerPillarKey = "research" | "venture" | "hackathons";

/** The pillar keys, in the code order. */
export const partnerPillarKeys: readonly PartnerPillarKey[] = [
  "research",
  "venture",
  "hackathons",
];

/**
 * Each pillar's headline figure: a site fact, so it is derived from the
 * render's facts (`getSiteFacts()`) rather than written as copy (the
 * hackathon count reads "2500+", without the grouping the
 * `{{impact.hackathonParticipants}}` placeholder has in running text).
 */
export function partnerPillarMetricsOf({
  impact,
  eLab,
}: Pick<SiteFacts, "impact" | "eLab">): Readonly<
  Record<PartnerPillarKey, string>
> {
  return {
    research: `${impact.publications}+`,
    venture: `${eLab.ventureFundingMillions}M`,
    hackathons: `${impact.hackathonParticipants}+`,
  };
}

/** A pillar card as the page renders it. */
export type PartnerPillar = {
  key: PartnerPillarKey;
  title: string;
  metric: string;
  metricLabel: string;
  description: string;
  image: ContentImage;
  href: string;
};

/** The pillar cards as templates: descriptions may hold placeholders. */
export const partnerPillarTemplates: readonly Omit<PartnerPillar, "metric">[] =
  [
    {
      key: "research",
      title: "Research",
      metricLabel: "Publications",
      description:
        "At top-tier conferences (MIT, Cambridge, Harvard, IBM Research). Collabs with frontier AI labs, path to NeurIPS, ICML and ICLR papers, partners shape the research agenda directly.",
      image: {
        src: "/assets/homepage/IBM_visit.webp",
        width: 1920,
        height: 1440,
        alt: "TUM.ai members visiting IBM",
      },
      href: "/research",
    },
    {
      key: "venture",
      title: "Venture (E-Lab)",
      metricLabel: "Raised",
      description:
        "Raised by alumni and counting (YC, EWOR, Spherecast, Mercura, dryft). 25 teams each incubator iteration, alumni backed by YC, EWOR and top VCs, partners join exclusive demo days early.",
      image: {
        src: "/assets/homepage/venture_onboarding25.webp",
        width: 1440,
        height: 1920,
        alt: "TUM.ai E-Lab venture community",
      },
      href: "/e-lab",
    },
    {
      key: "hackathons",
      title: "Hackathons",
      metricLabel: "Hackers",
      description:
        "Over all our hackathons (OpenAI, AWS, Anthropic, Google). {{community.makeathonSize}}+ hackers at our signature Makeathon, European Hackathon League across 4 cities (Munich, Berlin, Zurich, Paris), partners host challenges, booths and company pitches.",
      image: {
        src: "/assets/homepage/Makeathon.webp",
        width: 1920,
        height: 1280,
        alt: "The TUM.ai Makeathon team",
      },
      href: "/events",
    },
  ];

/**
 * Pillar templates with placeholders filled and their figures from
 * `metrics` ({@link partnerPillarMetricsOf}).
 */
export function fillPartnerPillars(
  templates: readonly Omit<PartnerPillar, "metric">[],
  tokens: ContentTokens,
  metrics: Readonly<Record<PartnerPillarKey, string>>,
): PartnerPillar[] {
  return templates.map((pillar) => ({
    ...pillar,
    metric: metrics[pillar.key],
    description: fillCodeTemplate(pillar.description, tokens),
  }));
}

/** A member profile on /partners ("The cracked 2%."). */
export type PartnerProfile = {
  name: string;
  role: string;
  /** One line under the role; empty for none. */
  detail: string;
  image: string;
  /** CSS `object-position` of the portrait. */
  position: string;
};

export const partnerProfiles: readonly PartnerProfile[] = [
  {
    name: "Leonie Freisinger",
    role: "Co-Founder & CTO @Dryft",
    detail: "5M raised, GC/Neo-backed",
    image: "/assets/partners/people/leonie-portrait.webp",
    position: "56% 35%",
  },
  {
    name: "Mohamed Elrefaie",
    role: "PhD Researcher @MIT",
    detail: "Schwarzman College",
    image: "/assets/partners/people/mohamed-portrait.webp",
    position: "52% 30%",
  },
  {
    name: "Jasmin El-Wafi",
    role: "ML Consultant & Systems Architect @AWS",
    detail: "",
    image: "/assets/partners/people/jasmin-portrait.webp",
    position: "55% 35%",
  },
];

/**
 * How partners meet the members, in one sentence: the partner fork in the
 * closing bands of /apply, /community and /qanda.
 */
export const partnerPitch =
  "Partners meet our members through talent packages, hackathon challenges and company visits.";

/** A partner case: one measured outcome, its story and a photo. */
export type PartnerCaseStudy = {
  /** The partner's organisation key (`data/organizations.ts`). */
  organization: string;
  name: string;
  metric: string;
  label: string;
  /** The outcome in a few words, for the homepage ledger. */
  summary: string;
  copy: string;
  /** Who said it, when `copy` is a quote. */
  attribution?: string;
  image: string;
  alt: string;
  /** CSS `object-position` of the photo. */
  imagePosition: string;
};

export const partnerCaseStudies: readonly PartnerCaseStudy[] = [
  {
    organization: "quantco",
    name: "QuantCo",
    metric: "75%",
    label: "From collaboration to colleagues",
    summary: "3 of 4 project members hired full-time",
    copy: "From one joint project, 3 out of 4 members joined QuantCo full-time. A 75% conversion from collaboration to permanent hires.",
    image: "/assets/partners/cases/quantco.webp",
    alt: "Participants listening to a hackathon presentation",
    imagePosition: "center",
  },
  {
    organization: "bmw",
    name: "BMW",
    metric: "48h",
    label: "Real challenges. Tangible results.",
    summary: "40 AI engineers, tangible results in 48 hours",
    copy: '"40 of Munich\'s best AI engineers. Some really tangible results. In just 48 hours."',
    attribution: "Manuel, Head of Innovation, BMW Group",
    image: "/assets/partners/cases/bmw.webp",
    alt: "Participants at the BMW and OpenAI hackathon",
    imagePosition: "center",
  },
  {
    organization: "osapiens",
    name: "Osapiens",
    metric: "20+",
    label: "Applications into the hiring pipeline",
    summary: "Applications from a single hackathon",
    copy: "One hackathon. 40 competing teams. 20+ applications straight into the hiring pipeline.",
    image: "/assets/partners/cases/osapiens.webp",
    alt: "Hackathon participants collaborating on their laptops",
    imagePosition: "center",
  },
];

/** The /partners copy as the page renders it, from code or the CMS. */
export type PartnersCopy = PartnershipFinderCopy & {
  pitch: string;
  reasons: readonly PartnerReason[];
  stats: readonly PartnerStat[];
  pillars: readonly PartnerPillar[];
};
