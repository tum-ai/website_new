import "server-only";
import { defineQuery } from "next-sanity";
import { loadContent } from "@/lib/cms-content";
import {
  ContentError,
  contentImage,
  contentString,
  optionalString,
  requireArray,
  requireObject,
  toContentImage,
} from "@/lib/cms-content-model";
import { getLogoLists } from "@/lib/organization-content";
import { personRoleLine } from "@/lib/people-and-logos";
import { getPeople } from "@/lib/person-content";
import { isHttpsUrl } from "@/lib/security";
import {
  type NotableStartup,
  notableStartupOf,
  type TestimonialCard,
  type TracedVenture,
} from "./data/venture-page";

const VENTURE_TRACE_QUERY = defineQuery(
  `*[_id == "ventureTrace"][0]{"startupId":venture->key,"testimonialId":person->key,"founderContext":person->context,"founderPlacement":person->placement,"startupListed":venture._ref in *[_id == "logolist-e-lab-ventures"][0].organizations[]._ref,cohort,now,"after":milestones[]{text,source}}`,
);
const E_LAB_VOICES_QUERY = defineQuery(
  `*[_id == "eLabCopy"][0]{voices{"founders":founders[]->{key,placement},"investors":investors[]->{key,placement}}}`,
);
/** The CMS founder and investor selections used by the voices band. */
export type ELabVoices = { founders: string[]; investors: string[] };
function voiceKey(value: unknown, path: string): string {
  const person = requireObject(value, "E-Lab voices", path);
  if (person.placement !== "e-lab-testimonial")
    throw new ContentError(
      "E-Lab voices",
      path,
      "must reference an E-Lab testimonial",
    );
  return contentString(person.key, "E-Lab voices", `${path}.key`);
}

/** Editorial selections are references, rather than hardcoded testimonial keys. */
export function getELabVoices(): Promise<ELabVoices> {
  return loadContent<ELabVoices, unknown>({
    query: E_LAB_VOICES_QUERY,
    tags: ["content:eLabCopy", "content:person"],
    label: "E-Lab voices",
    select: (result) => {
      const document = requireObject(result, "E-Lab voices");
      const voices = requireObject(document.voices, "E-Lab voices", "voices");
      return {
        founders: requireArray(voices.founders, "E-Lab voices", "founders").map(
          (key, index) => voiceKey(key, `founders[${index}]`),
        ),
        investors: requireArray(
          voices.investors,
          "E-Lab voices",
          "investors",
        ).map((key, index) => voiceKey(key, `investors[${index}]`)),
      };
    },
  });
}
/** Optional alumni venture logo list, in CMS order. */
export async function getNotableStartups(): Promise<NotableStartup[]> {
  const lists = await getLogoLists({
    surfaces: ["e-lab-ventures"],
    label: "E-Lab ventures",
  });
  return lists["e-lab-ventures"].map((organization) => {
    const startup = notableStartupOf(organization);
    if (!startup)
      throw new ContentError(
        "E-Lab ventures",
        organization.key,
        "requires a light logo",
      );
    return startup;
  });
}
/** Testimonial collection; portraits, quotes and organization logos attribute each person. */
export function getTestimonialCards(): Promise<TestimonialCard[]> {
  return getPeople({
    placement: "e-lab-testimonial",
    label: "E-Lab testimonials",
    select: (person) => {
      const portrait = toContentImage(person.portrait),
        logo = toContentImage(person.organization?.logo);
      if (!portrait || !logo)
        throw new ContentError(
          "E-Lab testimonials",
          person.key ?? "",
          "requires portrait and organization logo",
        );
      contentImage(portrait, "E-Lab testimonials", "portrait");
      contentImage(logo, "E-Lab testimonials", "organization.logo");
      contentString(logo.alt, "E-Lab testimonials", "organization.logo.alt");
      return {
        id: contentString(person.key, "E-Lab testimonials", "key"),
        name: contentString(person.name, "E-Lab testimonials", "name"),
        role: personRoleLine(
          contentString(person.role, "E-Lab testimonials", "role"),
          person.organization,
          person.roleAtOrganization,
        ),
        ...(person.context != null
          ? {
              context: optionalString(
                person.context,
                "E-Lab testimonials",
                "context",
              ),
            }
          : {}),
        quote: contentString(person.quote, "E-Lab testimonials", "quote"),
        portraitSrc: portrait.src,
        ...(portrait.objectPosition
          ? { portraitPosition: portrait.objectPosition }
          : {}),
        organizationLogoSrc: logo.src,
        organizationLogoAlt: logo.alt,
      };
    },
  });
}
/** Validate an indivisible venture/founder narrative, including the sourced milestones. */
export function selectTracedVenture(value: unknown): TracedVenture {
  const raw = requireObject(value, "ventureTrace");
  const startupId = contentString(raw.startupId, "ventureTrace", "venture");
  const testimonialId = contentString(
    raw.testimonialId,
    "ventureTrace",
    "person",
  );
  const cohort = contentString(raw.cohort, "ventureTrace", "cohort");
  if (raw.founderPlacement !== "e-lab-testimonial")
    throw new ContentError(
      "ventureTrace",
      "person",
      "must reference an E-Lab testimonial",
    );
  if (raw.startupListed !== true)
    throw new ContentError(
      "ventureTrace",
      "venture",
      "must be in the E-Lab ventures logo list",
    );
  if (
    contentString(
      raw.founderContext,
      "ventureTrace",
      "person.context",
    ).trim() !== cohort.trim()
  )
    throw new ContentError(
      "ventureTrace",
      "cohort",
      "must match the founder's testimonial context",
    );
  const after = requireArray(raw.after, "ventureTrace", "milestones").map(
    (item, index) => {
      const milestone = requireObject(
        item,
        "ventureTrace",
        `milestones[${index}]`,
      );
      const text = contentString(
        milestone.text,
        "ventureTrace",
        `milestones[${index}].text`,
      );
      const source = contentString(
        milestone.source,
        "ventureTrace",
        `milestones[${index}].source`,
      );
      if (!isHttpsUrl(source))
        throw new ContentError(
          "ventureTrace",
          `milestones[${index}].source`,
          "expected HTTPS source",
        );
      return { text, source };
    },
  );
  if (after.length === 0)
    throw new ContentError(
      "ventureTrace",
      "milestones",
      "requires at least one sourced milestone",
    );
  const now = optionalString(raw.now, "ventureTrace", "now");
  return {
    startupId,
    testimonialId,
    cohort,
    ...(now !== undefined ? { now } : {}),
    after,
  };
}
/** Required traced venture: malformed or unresolved references fail visibly. */
export function getTracedVenture(): Promise<TracedVenture> {
  return loadContent<TracedVenture, unknown>({
    query: VENTURE_TRACE_QUERY,
    tags: [
      "content:ventureTrace",
      "content:organization",
      "content:person",
      "content:logoList",
    ],
    label: "ventureTrace",
    select: selectTracedVenture,
  });
}
