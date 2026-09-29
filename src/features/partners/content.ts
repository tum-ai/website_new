import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { getSiteFacts } from "@/config/site-settings-content";
import {
  type BackfillDocument,
  backfillId,
  backfillImage,
} from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  toContentImage,
} from "@/lib/cms-content-model";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import { type ContentTokens, fillTemplate } from "@/lib/content-tokens";
import { organizationReference } from "@/lib/organization-content";
import { buildPersonBackfill, getPeople } from "@/lib/person-content";
import type {
  PARTNER_CASE_STUDIES_QUERY_RESULT,
  PARTNERS_COPY_QUERY_RESULT,
} from "@/lib/sanity.types.generated";
import { getSafeSitePath } from "@/lib/security";
import {
  fillPartnerPillars,
  fillPartnerStats,
  type PartnerCaseStudy,
  type PartnerPillar,
  type PartnerPillarKey,
  type PartnerProfile,
  type PartnerReason,
  type PartnerReasonIcon,
  type PartnerStat,
  type PartnersCopy,
  partnerCaseStudies,
  partnerPillarKeys,
  partnerPillarMetricsOf,
  partnerPillarTemplates,
  partnerPitch,
  partnerProfiles,
  partnerReasons,
  partnerStatTemplates,
  partnersSections,
} from "./data/partners";
import {
  type PartnershipDurationCopy,
  type PartnershipIntent,
  type PartnershipIntentCopy,
  type PartnershipRecommendations,
  partnershipDurations,
  partnershipIntents,
  partnershipPrompts,
  recommendations,
} from "./data/partnership-finder";
import { buildOrganizationBackfill } from "./organization-content";

/**
 * The /partners content slice: the `partnersCopy` singleton (finder, reasons,
 * figures, pillars, pitch, finder prompts, section headings), the `caseStudy` documents and the partner
 * profiles (`person`, placement `partner-profile`). Code fallbacks:
 * `data/partners.ts` and `data/partnership-finder.ts`. The logos are the
 * organisation slice (`organization-content.ts`).
 */

export const PARTNERS_COPY_QUERY = defineQuery(`*[_id == "partnersCopy"][0]{
  pitch,
  intents{
    talent{ label, shortLabel, detail },
    hackathon{ label, shortLabel, detail },
    brand{ label, shortLabel, detail },
    research{ label, shortLabel, detail }
  },
  durations{
    oneOff{ label, detail },
    ongoing{ label, detail }
  },
  recommendations{
    longTerm{ name, description },
    hackathon{ name, description },
    talent{ name, description },
    brand{ name, description },
    research{ name, description }
  },
  reasons[]{ icon, name, title, description },
  stats[]{ value, label, detail },
  pillars[]{
    key,
    title,
    metricLabel,
    description,
    "image": image${CONTENT_IMAGE_PROJECTION},
    href
  },
  prompts{
    intentQuestion,
    durationQuestion,
    resultQuestion,
    firstChoice,
    bookingTitle,
    bookingLead,
    bookingSlow
  },
  sections{
    hero{ eyebrow, title, lead, contactLabel, fitLabel, caption },
    marquee{ label, link },
    finder{ eyebrow, title, lead, note },
    reasons{ title, lead, contact },
    proof{ title, caption },
    pillars{ title, lead },
    people{ title, lead, statLabel, tagline, alumniTitle },
    directory{ title, lead, supportersTitle },
    cases{ title, lead, contact },
    contact{ title, lead, emailLabel }
  }
}`);

export const PARTNER_CASE_STUDIES_QUERY =
  defineQuery(`*[_type == "caseStudy"] | order(order asc){
  "organization": organization->key,
  "name": organization->name,
  metric,
  label,
  summary,
  copy,
  attribution,
  "image": image${CONTENT_IMAGE_PROJECTION}
}`);

type IntentWording = Omit<PartnershipIntentCopy, "id">;
type DurationWording = Omit<PartnershipDurationCopy, "id">;

/**
 * The copy as the CMS singleton holds it: the finder's fixed answers keyed
 * by id (so an empty field keeps the code wording field by field), figures
 * and descriptions already filled.
 */
type PartnersCopySource = Omit<PartnersCopy, "intents" | "durations"> & {
  intents: Record<PartnershipIntent, IntentWording>;
  durations: { oneOff: DurationWording; ongoing: DurationWording };
};

const durationFields = { "one-off": "oneOff", ongoing: "ongoing" } as const;

type PillarMetrics = ReturnType<typeof partnerPillarMetricsOf>;

function codeCopySource(
  tokens: ContentTokens,
  metrics: PillarMetrics,
): PartnersCopySource {
  return {
    pitch: partnerPitch,
    intents: Object.fromEntries(
      partnershipIntents.map(({ id, ...wording }) => [id, wording]),
    ) as Record<PartnershipIntent, IntentWording>,
    durations: {
      oneOff: partnershipDurations[0],
      ongoing: partnershipDurations[1],
    },
    recommendations: fillCodeCopy(recommendations, tokens),
    reasons: fillCodeCopy(partnerReasons, tokens),
    stats: fillPartnerStats(partnerStatTemplates, tokens),
    pillars: fillPartnerPillars(partnerPillarTemplates, tokens, metrics),
    prompts: partnershipPrompts,
    sections: fillCodeCopy(partnersSections, tokens),
  };
}

const reasonIcons: readonly PartnerReasonIcon[] = [
  "users",
  "briefcase",
  "network",
];
const isReasonIcon = (value: string | null): value is PartnerReasonIcon =>
  reasonIcons.includes(value as PartnerReasonIcon);
const isPillarKey = (value: string | null): value is PartnerPillarKey =>
  partnerPillarKeys.includes(value as PartnerPillarKey);

type CopyResult = NonNullable<PARTNERS_COPY_QUERY_RESULT>;

/**
 * CMS reasons, complete ones only, with their placeholders filled; an
 * unknown placeholder drops the reason.
 */
function selectReasons(
  reasons: CopyResult["reasons"],
  tokens: ContentTokens,
): PartnerReason[] | undefined {
  if (!reasons) return undefined;
  const filled = fillCmsCopy(reasons, tokens, "the partner reasons");
  return (Array.isArray(filled) ? filled : []).flatMap(
    ({ icon, name, title, description }): PartnerReason[] =>
      isReasonIcon(icon) && name && title && description
        ? [{ icon, name, title, description }]
        : [],
  );
}

/** CMS stats with their placeholders filled; unknown placeholders drop the stat. */
function selectStats(
  stats: CopyResult["stats"],
  tokens: ContentTokens,
): PartnerStat[] | undefined {
  return stats?.flatMap(({ value, label, detail }) => {
    const filledValue = fillTemplate(value ?? "", tokens);
    const filledDetail = detail ? fillTemplate(detail, tokens) : undefined;
    if (!filledValue || !label || filledDetail === null) return [];
    return [
      {
        value: filledValue,
        label,
        ...(filledDetail ? { detail: filledDetail } : {}),
      },
    ];
  });
}

/**
 * CMS pillars, complete ones only (their link a page of this site), with
 * the figure of their key. Exported for tests.
 */
export function selectPillars(
  pillars: CopyResult["pillars"],
  tokens: ContentTokens,
  metrics: PillarMetrics,
): PartnerPillar[] | undefined {
  return pillars?.flatMap(
    ({ key, title, metricLabel, description, image, href }) => {
      const photo = toContentImage(image);
      const filled = fillTemplate(description ?? "", tokens);
      const link = getSafeSitePath(href);
      if (
        !isPillarKey(key) ||
        !title ||
        !metricLabel ||
        !filled ||
        !photo ||
        !link
      ) {
        return [];
      }
      return [
        {
          key,
          title,
          metric: metrics[key],
          metricLabel,
          description: filled,
          image: photo,
          href: link,
        },
      ];
    },
  );
}

/**
 * The /partners copy: the CMS `partnersCopy` fields that are set, the code
 * copy for the rest. The finder's answers keep their code ids and order.
 */
export async function getPartnersCopy(): Promise<PartnersCopy> {
  const [tokens, facts] = await Promise.all([
    getContentTokens(),
    getSiteFacts(),
  ]);
  const metrics = partnerPillarMetricsOf(facts);
  const source = await loadContent<
    PartnersCopySource,
    PARTNERS_COPY_QUERY_RESULT
  >({
    fallback: codeCopySource(tokens, metrics),
    query: PARTNERS_COPY_QUERY,
    tags: ["content:partnersCopy"],
    label: "the partners page copy",
    mockDocuments: partnersMockDocuments,
    select: (result) =>
      result && {
        pitch: result.pitch,
        intents: result.intents,
        durations: result.durations,
        recommendations: fillCmsCopy(
          result.recommendations,
          tokens,
          "the partnership formats",
        ),
        reasons: selectReasons(result.reasons, tokens),
        stats: selectStats(result.stats, tokens),
        pillars: selectPillars(result.pillars, tokens, metrics),
        prompts: result.prompts,
        // Also drops blank lines from the line lists, so a heading whose
        // lines are all blank keeps the code lines.
        sections: fillCmsCopy(
          result.sections,
          tokens,
          "the /partners sections",
        ),
      },
  });
  return {
    ...source,
    intents: partnershipIntents.map(({ id }) => ({
      id,
      ...source.intents[id],
    })),
    durations: partnershipDurations.map(({ id }) => ({
      id,
      ...source.durations[durationFields[id]],
    })),
  };
}

/** The partner cases, in order: the CMS case studies, or the code list. */
export function getPartnerCaseStudies(): Promise<PartnerCaseStudy[]> {
  return loadContent<PartnerCaseStudy[], PARTNER_CASE_STUDIES_QUERY_RESULT>({
    fallback: [...partnerCaseStudies],
    query: PARTNER_CASE_STUDIES_QUERY,
    tags: ["content:caseStudy", "content:organization"],
    label: "the partner case studies",
    mockDocuments: partnersMockDocuments,
    select: (result) =>
      result.flatMap((study) => {
        const image = toContentImage(study.image);
        const { organization, name, metric, label, summary, copy } = study;
        if (
          !organization ||
          !name ||
          !metric ||
          !label ||
          !summary ||
          !copy ||
          !image
        ) {
          return [];
        }
        return [
          {
            organization,
            name,
            metric,
            label,
            summary,
            copy,
            ...(study.attribution ? { attribution: study.attribution } : {}),
            image: image.src,
            alt: image.alt,
            imagePosition: image.objectPosition ?? "center",
          },
        ];
      }),
  });
}

/** The member profiles on /partners: the CMS people, or the code list. */
export function getPartnerProfiles(): Promise<PartnerProfile[]> {
  return getPeople<PartnerProfile>({
    placement: "partner-profile",
    fallback: [...partnerProfiles],
    label: "the partner profiles",
    mockDocuments: partnersMockDocuments,
    select: ({ key, name, role, context, portrait }) => {
      const image = toContentImage(portrait);
      if (!name || !role || !image) return null;
      return {
        key,
        name,
        role,
        detail: context ?? "",
        image: image.src,
        position: image.objectPosition ?? "50% 50%",
      };
    },
  });
}

function partnersCopyDocument(): BackfillDocument {
  return {
    _id: "partnersCopy",
    _type: "partnersCopy",
    pitch: partnerPitch,
    intents: Object.fromEntries(
      partnershipIntents.map(({ id, label, shortLabel, detail }) => [
        id,
        { label, shortLabel, detail },
      ]),
    ),
    durations: Object.fromEntries(
      partnershipDurations.map(({ id, label, detail }) => [
        durationFields[id],
        { label, detail },
      ]),
    ),
    recommendations: recommendations satisfies PartnershipRecommendations,
    reasons: partnerReasons.map((reason, index) => ({
      _key: `reason-${index + 1}`,
      _type: "reason",
      ...reason,
    })),
    stats: partnerStatTemplates.map((stat, index) => ({
      _key: `stat-${index + 1}`,
      _type: "stat",
      ...stat,
    })),
    pillars: partnerPillarTemplates.map(({ image, ...pillar }) => ({
      _key: pillar.key,
      _type: "pillar",
      ...pillar,
      image: backfillImage(image.src, {
        alt: image.alt,
        objectPosition: image.objectPosition,
      }),
    })),
    prompts: partnershipPrompts,
    sections: partnersSections,
  };
}

/**
 * The /partners copy, case studies and profiles as documents for
 * `pnpm sanity:backfill`. The organisations the case studies reference are
 * the organisation slice's.
 */
export function buildPartnersBackfill(): BackfillDocument[] {
  return [
    partnersCopyDocument(),
    ...partnerCaseStudies.map((study, index) => ({
      _id: backfillId("caseStudy", study.organization),
      _type: "caseStudy",
      organization: organizationReference(study.organization),
      order: (index + 1) * 10,
      metric: study.metric,
      label: study.label,
      summary: study.summary,
      copy: study.copy,
      ...(study.attribution ? { attribution: study.attribution } : {}),
      image: backfillImage(study.image, {
        alt: study.alt,
        ...(study.imagePosition === "center"
          ? {}
          : { objectPosition: study.imagePosition }),
      }),
    })),
    ...buildPersonBackfill(
      "partner-profile",
      partnerProfiles.map(({ key, name, role, detail, image, position }) => ({
        key,
        name,
        role,
        ...(detail ? { context: detail } : {}),
        portrait: { src: image, objectPosition: position },
      })),
    ),
  ];
}

/** The mock CMS dataset: this slice plus the organisations it references. */
function partnersMockDocuments(): BackfillDocument[] {
  return [...buildPartnersBackfill(), ...buildOrganizationBackfill()];
}
