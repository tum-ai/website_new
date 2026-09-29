import "server-only";

import { defineQuery } from "next-sanity";
import { cache } from "react";
import { type BackfillDocument, backfillImage } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  toContentImage,
} from "@/lib/cms-content-model";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { getCalBooking } from "@/lib/security";
import type { LinkedHeaderCtaVariant } from "./navigation";
import { type SiteFacts, siteFactsFallback } from "./site-facts";

/**
 * The site-facts slice: the `siteSettings` singleton in the CMS,
 * or the config constants (`siteFactsFallback`). Server only; client islands
 * get the values they need as props.
 */

export const SITE_SETTINGS_QUERY =
  defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
  organization{ foundingYear, activeMembers, alumni, majors, universities, nationalities },
  brandMission,
  impact{ publications, publicationVenues, hackathonParticipants },
  community{ makeathonSize },
  contactEmails{ general, partners, venture, recruitment },
  socialLinks{ linkedin, instagram, github, x, youtube, facebook, tiktok, slack },
  partnershipBooking{ bookingUrl, bookingHost },
  eLab{
    currentIteration,
    programWeeks,
    ventureFundingMillions,
    selection{ applications, admitted, midterm, selectionDay, finalPitch },
    "heroLogo": heroLogo${CONTENT_IMAGE_PROJECTION}
  },
  footerTagline,
  headerCtaFallback
}`);

type ELabResult = NonNullable<NonNullable<SITE_SETTINGS_QUERY_RESULT>["eLab"]>;

const headerCtaFallbacks: readonly string[] = [
  "member",
  "partner",
  "elab",
] satisfies LinkedHeaderCtaVariant[];

/** The value when it is a finite number, else `undefined` (the code value). */
const number = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const https = (value: string | null | undefined) =>
  value?.startsWith("https://") ? value : undefined;

const email = (value: string | null | undefined) =>
  value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? value : undefined;

/** Keeps exactly the fallback's keys of `record`, each through `pick`. */
function fields<K extends string, V>(
  keys: readonly K[],
  record: Partial<Record<K, V | null>> | null | undefined,
  pick: (value: V | null | undefined) => unknown,
): Partial<Record<K, unknown>> | undefined {
  if (!record) return undefined;
  return Object.fromEntries(
    keys.map((key) => [key, pick(record[key])]),
  ) as Partial<Record<K, unknown>>;
}

const keysOf = <T extends object>(object: T) =>
  Object.keys(object) as (keyof T & string)[];

/**
 * The booking page and its host as one pair: a Cal page (`getCalBooking`)
 * and a name, or nothing, so the dialog never introduces one person's page
 * as a chat with another.
 */
function partnershipBooking(
  value: NonNullable<SITE_SETTINGS_QUERY_RESULT>["partnershipBooking"],
) {
  if (!value) return undefined;
  const bookingHost = value.bookingHost?.trim();
  if (getCalBooking(value.bookingUrl) && bookingHost) {
    return { bookingUrl: value.bookingUrl, bookingHost };
  }
  console.warn(
    "[cms-content] The partnership booking needs a cal.eu or cal.com booking page and its host's name; rendering the code booking.",
  );
  return undefined;
}

/** The funnel only as a whole, and only when each gate is at most the one before. */
function selection(value: ELabResult["selection"]) {
  if (!value) return undefined;
  const gates = [
    value.applications,
    value.admitted,
    value.midterm,
    value.selectionDay,
    value.finalPitch,
  ];
  const valid = gates.every(
    (gate, index) =>
      typeof gate === "number" &&
      gate > 0 &&
      (index === 0 || gate <= (gates[index - 1] as number)),
  );
  return valid ? value : undefined;
}

/**
 * The document shaped like {@link SiteFacts}, leaving out anything unusable
 * (wrong type, a non-https link, a malformed email or cohort, a funnel that
 * widens, a booking page off Cal or without its host), so the code value
 * shows there instead. Exported for tests.
 */
export function selectSiteFacts(result: SITE_SETTINGS_QUERY_RESULT) {
  if (!result) return null;
  const fallback = siteFactsFallback;
  const { eLab } = result;
  return {
    organization: fields(
      keysOf(fallback.organization),
      result.organization,
      number,
    ),
    brandMission: result.brandMission,
    impact: result.impact && {
      publications: number(result.impact.publications),
      publicationVenues: result.impact.publicationVenues?.filter(
        (venue) => venue.trim() !== "",
      ),
      hackathonParticipants: number(result.impact.hackathonParticipants),
    },
    community: result.community && {
      makeathonSize: number(result.community.makeathonSize),
    },
    contactEmails: fields(
      keysOf(fallback.contactEmails),
      result.contactEmails,
      email,
    ),
    socialLinks: fields(
      keysOf(fallback.socialLinks),
      result.socialLinks,
      https,
    ),
    partnershipBooking: partnershipBooking(result.partnershipBooking),
    eLab: eLab && {
      currentIteration: /^\d{1,2}\.\d$/.test(eLab.currentIteration ?? "")
        ? eLab.currentIteration
        : undefined,
      programWeeks: number(eLab.programWeeks),
      ventureFundingMillions: number(eLab.ventureFundingMillions),
      selection: selection(eLab.selection),
      heroLogo: toContentImage(eLab.heroLogo),
    },
    footerTagline: result.footerTagline,
    headerCtaFallback: headerCtaFallbacks.includes(
      result.headerCtaFallback ?? "",
    )
      ? result.headerCtaFallback
      : undefined,
  };
}

/**
 * The site facts for this render: the `siteSettings` document over the
 * config constants when `CMS_CONTENT_SOURCE=sanity`, the constants
 * otherwise. Cached per request (`react` `cache`), so the layout, the
 * sections and `getContentTokens()` share one read.
 */
export const getSiteFacts = cache(
  (): Promise<SiteFacts> =>
    loadContent<SiteFacts, SITE_SETTINGS_QUERY_RESULT>({
      fallback: siteFactsFallback,
      query: SITE_SETTINGS_QUERY,
      tags: ["content:siteSettings"],
      label: "the site settings",
      mockDocuments: buildSiteSettingsBackfill,
      select: selectSiteFacts,
    }),
);

/** The `siteSettings` singleton recreating the code facts, for `pnpm sanity:backfill`. */
export function buildSiteSettingsBackfill(): BackfillDocument[] {
  const facts = siteFactsFallback;
  const { heroLogo, ...eLab } = facts.eLab;
  return [
    {
      _id: "siteSettings",
      _type: "siteSettings",
      organization: { ...facts.organization },
      brandMission: facts.brandMission,
      impact: {
        ...facts.impact,
        publicationVenues: [...facts.impact.publicationVenues],
      },
      community: { ...facts.community },
      contactEmails: { ...facts.contactEmails },
      socialLinks: { ...facts.socialLinks },
      partnershipBooking: { ...facts.partnershipBooking },
      eLab: {
        ...eLab,
        selection: { ...eLab.selection },
        heroLogo: backfillImage(heroLogo.src, { alt: heroLogo.alt }),
      },
      footerTagline: facts.footerTagline,
      headerCtaFallback: facts.headerCtaFallback,
    },
  ];
}
