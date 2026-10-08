import type { ContentTokens } from "@/lib/content-tokens";
import { type ELabApplicationWindow, eLabApplicationCopyOf } from "./e-lab";
import { leagueSummaryOf } from "./hackathons";
import {
  type MembershipConfig,
  recruitingTimelineOf,
  roundSchedule,
} from "./membership";
import {
  acceptanceRateRoundedOf,
  admittedPerBatchOf,
  linkedinAudienceLabelOf,
} from "./organization";
import { getELabWindow, getMembershipWindow } from "./schedule-content";
import { deriveSiteFacts, type SiteFacts } from "./site-facts";
import { getSiteFacts } from "./site-settings-content";

/**
 * The values of the `{{name}}` placeholders in editable copy (the names and
 * the mechanism are in `lib/content-tokens.ts`). Each one is a fact from
 * this folder, so a config edit (or a CMS edit to `siteSettings` or an
 * application window) updates the code copy and the CMS copy alike.
 *
 * Server only: `getContentTokens()` reads the CMS through the server-only
 * slices, so client islands must not import this module; they receive
 * filled text as props.
 */

/** The resolved facts the placeholder values are built from. */
export type ContentTokenSources = {
  facts: SiteFacts;
  membership: MembershipConfig;
  eLab: ELabApplicationWindow;
};

/** The placeholder values for a set of resolved facts. */
export function contentTokensFor({
  facts,
  membership,
  eLab,
}: ContentTokenSources): ContentTokens {
  const derived = deriveSiteFacts(facts);
  const recruiting = recruitingTimelineOf(roundSchedule(membership.round));
  const { organization: org, impact } = facts;
  const league = leagueSummaryOf(facts.hackathons.league.matches);
  return {
    "recruiting.application": recruiting.application,
    "recruiting.interview": recruiting.interview,
    "recruiting.onboarding": recruiting.onboarding,
    "contact.recruitmentEmail": facts.contactEmails.recruitment,
    "eLab.programWeeks": String(facts.eLab.programWeeks),
    "eLab.deadline": eLabApplicationCopyOf(facts.eLab.currentIteration, eLab)
      .deadlineLabel,
    "eLab.programSummary": derived.eLabProgramSummary,
    "eLab.completedCohorts": String(derived.eLabCompletedIterations),
    "eLab.ventureFundingMillions": String(facts.eLab.ventureFundingMillions),
    "org.foundingYear": String(org.foundingYear),
    "org.activeMembers": String(org.activeMembers),
    "org.alumni": String(org.alumni),
    "org.officialMembers": String(derived.officialMembers),
    "org.majors": String(org.majors),
    "org.universities": String(org.universities),
    "org.nationalities": String(org.nationalities),
    // "2.3" and "2", each followed by "%" in copy.
    "org.acceptanceRate": String(org.acceptanceRate),
    "org.acceptanceRateRounded": String(
      acceptanceRateRoundedOf(org.acceptanceRate),
    ),
    // "20k", followed by "+" in copy.
    // Ungrouped ("2100"), as the partner stats count it up.
    "org.startedApplications": String(org.startedApplicationsPerBatch),
    "org.admittedPerBatch": String(admittedPerBatchOf(org)),
    "org.linkedinAudience": linkedinAudienceLabelOf(org.linkedinAudience),
    "impact.publications": String(impact.publications),
    "impact.publicationVenues": derived.publicationVenuesText,
    // Grouped as in running text ("2,500"); stat figures stay derived in code.
    "impact.hackathonParticipants":
      impact.hackathonParticipants.toLocaleString("en"),
    "community.makeathonSize": String(facts.community.makeathonSize),
    "league.cities": league.citiesText,
    "league.cityCount": String(league.cities.length),
    "league.matchCount": String(league.matchCount),
    "league.foundedYear": String(facts.hackathons.league.foundedYear),
    "league.finaleTeams": String(facts.hackathons.league.finaleTeams),
  };
}

/** Resolve placeholder values from CMS facts and application windows for this render. */
export async function getContentTokens(): Promise<ContentTokens> {
  const [facts, membership, eLab] = await Promise.all([
    getSiteFacts(),
    getMembershipWindow(),
    getELabWindow(),
  ]);
  return contentTokensFor({ facts, membership, eLab });
}
