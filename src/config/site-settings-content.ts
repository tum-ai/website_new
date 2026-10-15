import "server-only";
import { defineQuery } from "next-sanity";
import { cache } from "react";
import { liveCacheTags } from "@/lib/cache-tags";
import { loadContent } from "@/lib/cms-content";
import {
  CONTENT_IMAGE_PROJECTION,
  type ContentParser,
  contentArray,
  contentBoolean,
  contentError,
  contentImage,
  contentNumber,
  contentObject,
  contentOptional,
  contentString,
  parseContent,
  requireEnum,
} from "@/lib/cms-content-model";
import { fillCmsCopy } from "@/lib/content-copy";
import { munichDateFromIsoDay, munichIsoDate } from "@/lib/munich-time";
import { durationUnits, programWeeksOf } from "@/lib/program-duration";
import { getCalBooking } from "@/lib/security";
import type { SiteFacts } from "./site-facts";

export const SITE_SETTINGS_QUERY =
  defineQuery(`*[_type == "siteSettings" && _id == "siteSettings"][0]{
 organization{foundingYear,activeMembers,alumni,majors,universities,nationalities,acceptanceRate,startedApplicationsPerBatch,linkedinAudience},
 brandMission,impact{publications,publicationVenues,hackathonParticipants},community{makeathonSize},
 contactEmails{general,partners,venture,recruitment},socialLinks{linkedin,instagram,github,x,youtube,facebook,tiktok,slack},
 partnershipBooking{bookingUrl,bookingHost},
 eLab{currentIteration,"programPhases":*[_type == "eLabCopy" && _id == "eLabCopy"][0].gates.stages[_type == "phaseStage"].duration{amount,unit},ventureFundingMillions,selection{applications,admitted,midterm,selectionDay,finalPitch},"heroLogo":heroLogo${CONTENT_IMAGE_PROJECTION}},
 hackathons{makeathonUrl,league{name,url,foundedYear,finaleTeams,matches[]{key,label,makeathon,"city":event->city,"start":event->event_date,"end":coalesce(event->end_date,event->event_date)}}},
 footerTagline,headerCtaFallback
}`);

const count: ContentParser<number> = (value, label, path) => {
  const n = contentNumber(value, label, path);
  if (!Number.isInteger(n) || n < 0)
    return contentError(label, path, "expected a nonnegative integer");
  return n;
};
const positive: ContentParser<number> = (value, label, path) => {
  const n = count(value, label, path);
  if (n === 0) return contentError(label, path, "expected a positive integer");
  return n;
};
const https: ContentParser<string> = (value, label, path) => {
  const text = contentString(value, label, path);
  try {
    if (new URL(text).protocol === "https:") return text;
  } catch {}
  return contentError(label, path, "expected an HTTPS URL");
};
const email: ContentParser<string> = (value, label, path) => {
  const text = contentString(value, label, path);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text))
    return contentError(label, path, "expected an email address");
  return text;
};
const date: ContentParser<string> = (value, label, path) => {
  const text = contentString(value, label, path);
  const day = text.slice(0, 10);
  if (!munichDateFromIsoDay(day) || Number.isNaN(Date.parse(text)))
    return contentError(label, path, "expected an event date");
  return munichIsoDate(new Date(text));
};
const match = contentObject({
  key: contentString,
  label: contentString,
  city: contentString,
  start: date,
  end: date,
  makeathon: contentOptional(contentBoolean),
});
/** One E-Lab phase's length (`eLabCopy`); the program length is their sum. */
const phaseDuration = contentObject({
  amount: positive,
  unit: (value: unknown, label: string, path: string) =>
    requireEnum(value, durationUnits, label, path),
});
const parser = contentObject({
  organization: contentObject({
    foundingYear: count,
    activeMembers: count,
    alumni: count,
    majors: count,
    universities: count,
    nationalities: count,
    acceptanceRate: contentNumber,
    startedApplicationsPerBatch: positive,
    linkedinAudience: count,
  }),
  brandMission: contentString,
  impact: contentObject({
    publications: count,
    publicationVenues: contentArray(contentString),
    hackathonParticipants: count,
  }),
  community: contentObject({ makeathonSize: count }),
  contactEmails: contentObject({
    general: email,
    partners: email,
    venture: email,
    recruitment: email,
  }),
  socialLinks: contentObject({
    linkedin: https,
    instagram: https,
    github: https,
    x: https,
    youtube: https,
    facebook: https,
    tiktok: https,
    slack: https,
  }),
  partnershipBooking: contentObject({
    bookingUrl: https,
    bookingHost: contentString,
  }),
  eLab: contentObject({
    currentIteration: contentString,
    programPhases: contentArray(phaseDuration),
    ventureFundingMillions: contentNumber,
    selection: contentObject({
      applications: positive,
      admitted: positive,
      midterm: positive,
      selectionDay: positive,
      finalPitch: positive,
    }),
    heroLogo: contentImage,
  }),
  hackathons: contentObject({
    makeathonUrl: https,
    league: contentObject({
      name: contentString,
      url: https,
      foundedYear: count,
      finaleTeams: positive,
      matches: contentArray(match),
    }),
  }),
  footerTagline: contentString,
  headerCtaFallback: (value, label, path) =>
    requireEnum(value, ["member", "partner", "elab"] as const, label, path),
});

/** Validate all site facts atomically, including cross-field programme constraints. */
export function selectSiteFacts(value: unknown): SiteFacts {
  const result = parseContent(
    fillCmsCopy(value, {}, "siteSettings"),
    parser,
    "siteSettings",
  );
  if (!getCalBooking(result.partnershipBooking.bookingUrl))
    return contentError(
      "siteSettings",
      "partnershipBooking.bookingUrl",
      "expected a Cal booking page",
    );
  if (
    result.organization.acceptanceRate < 0 ||
    result.organization.acceptanceRate > 100
  )
    return contentError(
      "siteSettings",
      "organization.acceptanceRate",
      "expected percentage in 0..100",
    );
  if (
    result.organization.foundingYear < 2000 ||
    result.organization.foundingYear > 2100
  )
    return contentError(
      "siteSettings",
      "organization.foundingYear",
      "expected year in 2000..2100",
    );
  if (!/^\d{1,2}\.\d$/.test(result.eLab.currentIteration))
    return contentError(
      "siteSettings",
      "eLab.currentIteration",
      "expected a cohort number",
    );
  const { programPhases, ...eLab } = result.eLab;
  const programWeeks = programWeeksOf(programPhases);
  if (programWeeks < 1 || programWeeks > 52)
    return contentError(
      "eLabCopy",
      "gates.stages",
      "the phases must add up to 1..52 weeks",
    );
  if (eLab.ventureFundingMillions < 0)
    return contentError("siteSettings", "eLab", "invalid funding");
  const gates = Object.values(result.eLab.selection);
  if (gates.some((n, index) => index > 0 && n > gates[index - 1]))
    return contentError(
      "siteSettings",
      "eLab.selection",
      "funnel must not widen",
    );
  if (!result.impact.publicationVenues.length)
    return contentError(
      "siteSettings",
      "impact.publicationVenues",
      "at least one venue is required",
    );
  const keys = new Set<string>();
  for (const m of result.hackathons.league.matches) {
    if (keys.has(m.key) || m.end < m.start)
      return contentError(
        "siteSettings",
        "hackathons.league.matches",
        "duplicate key or end before start",
      );
    keys.add(m.key);
  }
  return {
    ...result,
    eLab: { ...eLab, programWeeks },
    hackathons: {
      ...result.hackathons,
      league: {
        ...result.hackathons.league,
        matches: result.hackathons.league.matches.map(
          ({ makeathon, ...m }) => ({
            ...m,
            ...(makeathon ? { makeathon: true as const } : {}),
          }),
        ),
      },
    },
  };
}
/** Request-cached CMS site settings shared by the shell, copy placeholders, and SEO. */
export const getSiteFacts = cache(() =>
  loadContent({
    query: SITE_SETTINGS_QUERY,
    tags: ["content:siteSettings", "content:eLabCopy", ...liveCacheTags.event],
    label: "siteSettings",
    select: selectSiteFacts,
  }),
);
