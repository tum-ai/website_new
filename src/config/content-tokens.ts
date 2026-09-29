import type { ContentTokens } from "@/lib/content-tokens";
import { admittedPerBatchOf } from "./community";
import {
  type ELabApplicationWindow,
  eLabApplicationCopyOf,
  eLabWindowFallback,
} from "./e-lab";
import {
  type MembershipConfig,
  membershipConfig,
  recruitingTimelineOf,
  roundSchedule,
} from "./membership";
import {
  acceptanceRateRoundedOf,
  linkedinAudienceLabelOf,
} from "./organization";
import { getELabWindow, getMembershipWindow } from "./schedule-content";
import {
  deriveSiteFacts,
  type SiteFacts,
  siteFactsFallback,
} from "./site-facts";
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
    "org.linkedinAudience": linkedinAudienceLabelOf(org.linkedinAudience),
    "impact.publications": String(impact.publications),
    "impact.publicationVenues": derived.publicationVenuesText,
    // Grouped as in running text ("2,500"); stat figures stay derived in code.
    "impact.hackathonParticipants":
      impact.hackathonParticipants.toLocaleString("en"),
    "community.makeathonSize": String(facts.community.makeathonSize),
    // Stat figures: ungrouped ("2100"), as the partner stats count them up.
    "community.startedApplications": String(
      facts.community.startedApplicationsPerBatch,
    ),
    "community.acceptanceRate": String(facts.community.acceptanceRatePercent),
    "community.admittedPerBatch": String(admittedPerBatchOf(facts.community)),
  };
}

/**
 * The placeholder values from the config constants alone: for code
 * fallbacks built at module load. Content slices use `getContentTokens()`.
 */
export const contentTokens: ContentTokens = contentTokensFor({
  facts: siteFactsFallback,
  membership: membershipConfig,
  eLab: eLabWindowFallback,
});

/**
 * The placeholder values for one render: built from the site facts and the
 * application windows resolved for it (`getSiteFacts()`,
 * `getMembershipWindow()`, `getELabWindow()`), so they follow the CMS when
 * `CMS_CONTENT_SOURCE=sanity` and equal `contentTokens` otherwise. Content
 * slices fill CMS copy with these, never with the `contentTokens` constant.
 */
export async function getContentTokens(): Promise<ContentTokens> {
  const [facts, membership, eLab] = await Promise.all([
    getSiteFacts(),
    getMembershipWindow(),
    getELabWindow(),
  ]);
  return contentTokensFor({ facts, membership, eLab });
}
