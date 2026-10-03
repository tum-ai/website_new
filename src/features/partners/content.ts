import "server-only";
import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { getSiteFacts } from "@/config/site-settings-content";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  ContentError,
  type ContentParser,
  contentArray,
  contentImage,
  contentObject,
  contentOptional,
  contentString,
  contentText,
  optionalString,
  type ProjectedImage,
  parseContent,
  requireArray,
  requireEnum,
  requireObject,
  requireString,
  toContentImage,
} from "@/lib/cms-content-model";
import { fillCmsCopy } from "@/lib/content-copy";
import type { ContentTokens } from "@/lib/content-tokens";
import { personRoleLine } from "@/lib/people-and-logos";
import { getPeople } from "@/lib/person-content";
import { getSafeSitePath } from "@/lib/security";
import {
  type PartnerCaseStudy,
  type PartnerPillar,
  type PartnerProfile,
  type PartnersCopy,
  partnerPillarKeys,
  partnerPillarMetricsOf,
} from "./data/partners";
import {
  partnershipDurationIds,
  partnershipIntentIds,
} from "./data/partnership-finder";

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
    hero{ eyebrow, title, lead, contactLabel, fitLabel, caption, "image": image${CONTENT_IMAGE_PROJECTION} },
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
  "id": _id,
  "organization": organization->key,
  "name": organization->name,
  metric,
  label,
  summary,
  copy,
  attribution,
  "image": image${CONTENT_IMAGE_PROJECTION}
}`);

const imageParser = contentObject({
  src: contentString,
  width: (value, label, path) => {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
      throw new ContentError(label, path, "expected positive image dimension");
    return value;
  },
  height: (value, label, path) => {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
      throw new ContentError(label, path, "expected positive image dimension");
    return value;
  },
  alt: contentString,
  objectPosition: contentOptional(contentText),
});
/** Missing optional wording means no rendered text, rather than retired site copy. */
const optionalText: ContentParser<string> = (value, label, path) =>
  optionalString(value, label, path) ?? "";
const lines = contentArray(contentString);
const optionalLines: ContentParser<string[]> = (value, label, path) =>
  value == null ? [] : lines(value, label, path);
const intent = contentObject({
  label: contentString,
  shortLabel: contentString,
  detail: optionalText,
});
const duration = contentObject({ label: contentString, detail: optionalText });
const recommendation = contentObject({
  name: contentString,
  description: contentString,
});
const sectionsParser = contentObject({
  hero: contentObject({
    eyebrow: contentString,
    title: lines,
    lead: optionalText,
    contactLabel: contentString,
    fitLabel: contentString,
    caption: optionalLines,
    image: imageParser,
  }),
  marquee: contentObject({ label: contentString, link: contentString }),
  finder: contentObject({
    eyebrow: contentString,
    title: lines,
    lead: optionalText,
    note: optionalText,
  }),
  reasons: contentObject({
    title: lines,
    lead: optionalText,
    contact: contentString,
  }),
  proof: contentObject({ title: contentString, caption: optionalText }),
  pillars: contentObject({ title: lines, lead: optionalText }),
  people: contentObject({
    title: contentString,
    lead: optionalLines,
    statLabel: contentString,
    tagline: optionalLines,
    alumniTitle: contentString,
  }),
  directory: contentObject({
    title: lines,
    lead: optionalLines,
    supportersTitle: contentString,
  }),
  cases: contentObject({
    title: lines,
    lead: optionalLines,
    contact: contentString,
  }),
  contact: contentObject({
    title: lines,
    lead: optionalLines,
    emailLabel: contentString,
  }),
});
const copyParser = contentObject({
  pitch: contentString,
  intents: contentObject({
    talent: intent,
    hackathon: intent,
    brand: intent,
    research: intent,
  }),
  durations: contentObject({ oneOff: duration, ongoing: duration }),
  recommendations: contentObject({
    longTerm: recommendation,
    hackathon: recommendation,
    talent: recommendation,
    brand: recommendation,
    research: recommendation,
  }),
  reasons: (value, label, path) =>
    contentArray(
      contentObject({
        icon: (value, label, path) =>
          requireEnum(
            value,
            ["users", "briefcase", "network"] as const,
            label,
            path,
          ),
        name: contentString,
        title: contentString,
        description: contentString,
      }),
    )(value ?? [], label, path),
  stats: (value, label, path) =>
    contentArray(
      contentObject({
        value: contentString,
        label: contentString,
        detail: contentOptional(contentText),
      }),
    )(value ?? [], label, path),
  prompts: contentObject({
    intentQuestion: contentString,
    durationQuestion: contentString,
    resultQuestion: contentString,
    firstChoice: optionalText,
    bookingTitle: contentString,
    bookingLead: contentString,
    bookingSlow: optionalText,
  }),
  sections: sectionsParser,
});

/** Complete CMS pillar cards, carrying figures derived from this render's site facts. */
export function selectPillars(
  value: unknown,
  tokens: ContentTokens,
  metrics: ReturnType<typeof partnerPillarMetricsOf>,
): PartnerPillar[] {
  return requireArray(value ?? [], "partnersCopy", "pillars").map(
    (item, index) => {
      const pillar = requireObject(item, "partnersCopy", `pillars[${index}]`);
      const key = requireEnum(
        pillar.key,
        partnerPillarKeys,
        "partnersCopy",
        `pillars[${index}].key`,
      );
      const image = toContentImage(pillar.image as ProjectedImage);
      const href = getSafeSitePath(
        requireString(pillar.href, "partnersCopy", `pillars[${index}].href`),
      );
      if (!image || !href)
        throw new ContentError(
          "partnersCopy",
          `pillars[${index}]`,
          "requires an uploaded image and safe site path",
        );
      contentImage(image, "partnersCopy", `pillars[${index}].image`);
      requireString(image.alt, "partnersCopy", `pillars[${index}].image.alt`);
      const wording = parseContent(
        fillCmsCopy(pillar, tokens, "partnersCopy"),
        contentObject({
          title: contentString,
          metricLabel: contentString,
          description: contentString,
        }),
        "partnersCopy",
      );
      return { key, ...wording, metric: metrics[key], image, href };
    },
  );
}
/** Required singleton copy. Optional wording and explicit empty collections are preserved. */
export async function getPartnersCopy(): Promise<PartnersCopy> {
  const [tokens, facts] = await Promise.all([
    getContentTokens(),
    getSiteFacts(),
  ]);
  return loadContent<PartnersCopy, unknown>({
    query: PARTNERS_COPY_QUERY,
    tags: ["content:partnersCopy"],
    label: "partnersCopy",
    select: (result) => {
      const raw = requireObject(result, "partnersCopy");
      const source = parseContent(
        fillCmsCopy(raw, tokens, "partnersCopy", ["format", "host"]),
        copyParser,
        "partnersCopy",
      );
      return {
        ...source,
        pillars: selectPillars(
          raw.pillars,
          tokens,
          partnerPillarMetricsOf(facts),
        ),
        intents: partnershipIntentIds.map((id) => ({
          id,
          ...source.intents[id],
        })),
        durations: partnershipDurationIds.map((id) => ({
          id,
          ...source.durations[id === "one-off" ? "oneOff" : "ongoing"],
        })),
      };
    },
  });
}
/** Optional case studies. A present case requires its resolved organization and image. */
export function getPartnerCaseStudies(): Promise<PartnerCaseStudy[]> {
  return loadContent<PartnerCaseStudy[], unknown>({
    query: PARTNER_CASE_STUDIES_QUERY,
    tags: ["content:caseStudy", "content:organization"],
    label: "partner cases",
    select: (result) =>
      requireArray(result, "partner cases").map((item, index) => {
        const raw = requireObject(item, "partner cases", String(index));
        const image = toContentImage(raw.image as ProjectedImage);
        if (!image)
          throw new ContentError(
            "partner cases",
            String(index),
            "requires an uploaded image",
          );
        contentImage(image, "partner cases", `${index}.image`);
        requireString(image.alt, "partner cases", `${index}.image.alt`);
        const caseStudy = parseContent(
          raw,
          contentObject({
            id: contentString,
            organization: contentString,
            name: contentString,
            metric: contentString,
            label: contentString,
            summary: contentString,
            copy: contentString,
            attribution: contentOptional(contentText),
          }),
          "partner cases",
        );
        return {
          ...caseStudy,
          image: image.src,
          alt: image.alt,
          imagePosition: image.objectPosition ?? "center",
        };
      }),
  });
}
/** Optional profiles, each validated with its CMS attribution. */
export function getPartnerProfiles(): Promise<PartnerProfile[]> {
  return getPeople({
    placement: "partner-profile",
    label: "partner profiles",
    select: (person) => {
      const image = toContentImage(person.portrait);
      if (!image)
        throw new ContentError(
          "partner profiles",
          person.key ?? "",
          "requires an uploaded portrait",
        );
      contentImage(image, "partner profiles", "portrait");
      return {
        key: requireString(person.key, "partner profiles", "key"),
        name: requireString(person.name, "partner profiles", "name"),
        role: personRoleLine(
          requireString(person.role, "partner profiles", "role"),
          person.organization,
          person.roleAtOrganization,
        ),
        detail: person.context ?? "",
        image: image.src,
        position: image.objectPosition ?? "50% 50%",
      };
    },
  });
}
