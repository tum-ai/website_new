import "server-only";

import { defineQuery } from "next-sanity";
import { buildOrganizationBackfill } from "@/features/partners/server";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { toContentImage, whole } from "@/lib/cms-content-model";
import {
  buildLogoListDocument,
  getLogoLists,
  organizationReference,
} from "@/lib/organization-content";
import { buildPersonBackfill, getPeople, personId } from "@/lib/person-content";
import type { VENTURE_TRACE_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { isHttpsUrl } from "@/lib/security";
import {
  eLabLogoLists,
  type NotableStartup,
  notableStartupOf,
  type TestimonialCard,
  type TracedVenture,
  testimonialCards,
  testimonials,
  tracedVenture,
} from "./data/venture-page";

/**
 * The /e-lab venture slice: the alumni ventures (`logoList`
 * `e-lab-ventures`), the testimonials (`person`, placement
 * `e-lab-testimonial`; also quoted on the homepage) and the traced venture
 * (`ventureTrace` singleton). Code fallback: `data/venture-page.ts`. The
 * organisations themselves are the partners' organisation slice.
 */

const VENTURE_TRACE_QUERY = defineQuery(`*[_id == "ventureTrace"][0]{
  "startupId": venture->key,
  "testimonialId": person->key,
  cohort,
  now,
  "after": milestones[]{ text, source }
}`);

/** The alumni ventures, in order: the CMS list, or the code list. */
export async function getNotableStartups(): Promise<NotableStartup[]> {
  const lists = await getLogoLists({
    lists: eLabLogoLists,
    label: "the E-Lab ventures",
    mockDocuments: ventureMockDocuments,
  });
  return lists["e-lab-ventures"].flatMap(
    (organization) => notableStartupOf(organization) ?? [],
  );
}

/**
 * The E-Lab testimonials, by id: the CMS people, or the code list. The
 * voices band, the traced venture and the homepage quote pick from them by
 * `id` (the person's key).
 */
export function getTestimonialCards(): Promise<TestimonialCard[]> {
  return getPeople<TestimonialCard>({
    placement: "e-lab-testimonial",
    fallback: testimonialCards,
    label: "the E-Lab testimonials",
    mockDocuments: ventureMockDocuments,
    select: ({ key, name, role, context, quote, portrait, organization }) => {
      const image = toContentImage(portrait);
      const logo = toContentImage(organization?.logo);
      if (!quote || !image || !logo) {
        console.warn(
          `[cms-content] Skipping the E-Lab testimonial "${key}": it needs a quote, a portrait and an organisation with a light logo.`,
        );
        return null;
      }
      return {
        id: key,
        name,
        role,
        ...(context ? { context } : {}),
        quote,
        portraitSrc: image.src,
        ...(image.objectPosition
          ? { portraitPosition: image.objectPosition }
          : {}),
        organizationLogoSrc: logo.src,
        organizationLogoAlt: logo.alt,
      };
    },
  });
}

/**
 * The traced venture as a whole: the CMS trace when it is complete (the
 * venture and the founder resolve to keys, a cohort, at least one milestone
 * with an https source), otherwise the code trace. Never mixed: each field
 * describes the one venture, so the code's "and now ..." or milestones
 * under another startup would tell the wrong story.
 */
function selectTracedVenture(result: VENTURE_TRACE_QUERY_RESULT) {
  if (!result) return null;
  const { startupId, testimonialId, cohort, now } = result;
  const after = (result.after ?? []).flatMap(({ text, source }) =>
    text && source && isHttpsUrl(source) ? [{ text, source }] : [],
  );
  if (!startupId || !testimonialId || !cohort || after.length === 0) {
    console.warn(
      "[cms-content] The E-Lab traced venture needs a venture, a founder, a cohort and a sourced milestone; rendering the code trace.",
    );
    return null;
  }
  return whole<TracedVenture>({
    startupId,
    testimonialId,
    cohort,
    ...(now ? { now } : {}),
    after,
  });
}

/** The traced venture: the complete CMS trace, else the code trace. */
export function getTracedVenture(): Promise<TracedVenture> {
  return loadContent<TracedVenture, VENTURE_TRACE_QUERY_RESULT>({
    fallback: tracedVenture,
    query: VENTURE_TRACE_QUERY,
    tags: ["content:ventureTrace", "content:organization", "content:person"],
    label: "the E-Lab traced venture",
    mockDocuments: ventureMockDocuments,
    select: selectTracedVenture,
  });
}

/**
 * The ventures list, the testimonials and the traced venture as documents
 * for `pnpm sanity:backfill`. Their organisations are built by the
 * organisation slice (`buildOrganizationBackfill`).
 */
export function buildVentureBackfill(): BackfillDocument[] {
  return [
    buildLogoListDocument("e-lab-ventures", eLabLogoLists["e-lab-ventures"]),
    ...buildPersonBackfill(
      "e-lab-testimonial",
      testimonials.map(({ id, portraitSrc, ...testimonial }) => ({
        ...testimonial,
        key: id,
        portrait: { src: portraitSrc },
      })),
    ),
    {
      _id: "ventureTrace",
      _type: "ventureTrace",
      venture: organizationReference(tracedVenture.startupId),
      person: {
        _type: "reference",
        _ref: personId("e-lab-testimonial", tracedVenture.testimonialId),
      },
      cohort: tracedVenture.cohort,
      ...(tracedVenture.now ? { now: tracedVenture.now } : {}),
      milestones: tracedVenture.after.map(({ text, source }, index) => ({
        _key: `milestone-${index + 1}`,
        _type: "milestone",
        text,
        source,
      })),
    },
  ];
}

/** The mock CMS dataset: this slice plus the organisations it references. */
function ventureMockDocuments(): BackfillDocument[] {
  return [...buildVentureBackfill(), ...buildOrganizationBackfill()];
}
