import type { ContentTokens } from "@/lib/content-tokens";
import { communityFacts } from "./community";
import { contactEmails } from "./contact";
import {
  eLabApplicationCopy,
  eLabCompletedIterations,
  eLabConfig,
  eLabProgramSummary,
} from "./e-lab";
import { impactFacts, publicationVenuesText } from "./impact";
import { recruitingTimeline } from "./membership";
import { officialMembers, organizationFacts } from "./organization";

/**
 * The values of the `{{name}}` placeholders in editable copy (the names and
 * the mechanism are in `lib/content-tokens.ts`). Each one is a fact from
 * this folder, so a config edit updates the code copy and the CMS copy alike.
 */
export const contentTokens: ContentTokens = {
  "recruiting.application": recruitingTimeline.application,
  "recruiting.interview": recruitingTimeline.interview,
  "recruiting.onboarding": recruitingTimeline.onboarding,
  "contact.recruitmentEmail": contactEmails.recruitment,
  "eLab.programWeeks": String(eLabConfig.programWeeks),
  "eLab.deadline": eLabApplicationCopy.deadlineLabel,
  "eLab.programSummary": eLabProgramSummary,
  "eLab.completedCohorts": String(eLabCompletedIterations),
  "eLab.ventureFundingMillions": String(eLabConfig.ventureFundingMillions),
  "org.foundingYear": String(organizationFacts.foundingYear),
  "org.activeMembers": String(organizationFacts.activeMembers),
  "org.alumni": String(organizationFacts.alumni),
  "org.officialMembers": String(officialMembers),
  "org.majors": String(organizationFacts.majors),
  "org.universities": String(organizationFacts.universities),
  "org.nationalities": String(organizationFacts.nationalities),
  "impact.publications": String(impactFacts.publications),
  "impact.publicationVenues": publicationVenuesText,
  // Grouped as in running text ("2,500"); stat figures stay derived in code.
  "impact.hackathonParticipants":
    impactFacts.hackathonParticipants.toLocaleString("en"),
  "community.makeathonSize": String(communityFacts.makeathonSize),
};

/**
 * The placeholder values for one render. Content slices fill CMS copy with
 * these, never with the `contentTokens` constant, so the values can later come
 * from the CMS `siteSettings` document without touching every slice. Today it
 * resolves to `contentTokens`.
 */
export async function getContentTokens(): Promise<ContentTokens> {
  return contentTokens;
}
