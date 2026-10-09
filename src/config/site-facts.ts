import type { CommunityFacts } from "./community";
import type { ContactEmails, PartnershipBooking, SocialLinks } from "./contact";
import {
  type ELabFacts,
  eLabCohortNameOf,
  eLabCompletedIterationsOf,
  eLabProgramSummaryOf,
  ventureFundingTextOf,
} from "./e-lab";
import type { HackathonFacts } from "./hackathons";
import { type ImpactFacts, publicationVenuesTextOf } from "./impact";
import type { LinkedHeaderCtaVariant } from "./navigation";
import { type OrganizationFacts, officialMembersOf } from "./organization";
/** CMS site-settings facts and pure derived values. Legal identity, canonical site identity and navigation remain code-owned. */
export type SiteFacts = {
  organization: OrganizationFacts;
  hackathons: HackathonFacts;
  /** The mission as the brand guide states it (/apply, /qanda). */
  brandMission: string;
  impact: ImpactFacts;
  community: CommunityFacts;
  contactEmails: ContactEmails;
  socialLinks: SocialLinks;
  /** The Cal.eu page behind "Book a call" on /partners, and who it books. */
  partnershipBooking: PartnershipBooking;
  eLab: ELabFacts;
  /** The line under the footer logo. */
  footerTagline: string;
  /**
   * The header's call to action while membership applications are closed
   * and no campaign runs.
   */
  headerCtaFallback: LinkedHeaderCtaVariant;
};

/** Values computed from the facts, never stored. */
export type DerivedSiteFacts = {
  /** Active members plus alumni. */
  officialMembers: number;
  /** "ICML, ECCV, NeurIPS, and ICLR". */
  publicationVenuesText: string;
  /** "12-week equity-free AI startup incubator". */
  eLabProgramSummary: string;
  /** Cohorts that have run so far (the current one is still ahead). */
  eLabCompletedIterations: number;
  /** "E-Lab 6.0". */
  eLabCohortName: string;
  /** "€8M+": the ventures' funding, as every page states it. */
  ventureFundingText: string;
};

/**
 * The derived values of a set of facts. Pages derive them from the facts
 * resolved for the render (`deriveSiteFacts(await getSiteFacts())`), so a
 * CMS edit to a base fact updates every sentence that uses it.
 */
export function deriveSiteFacts(facts: SiteFacts): DerivedSiteFacts {
  return {
    officialMembers: officialMembersOf(facts.organization),
    publicationVenuesText: publicationVenuesTextOf(
      facts.impact.publicationVenues,
    ),
    eLabProgramSummary: eLabProgramSummaryOf(facts.eLab.programWeeks),
    eLabCompletedIterations: eLabCompletedIterationsOf(
      facts.eLab.currentIteration,
    ),
    eLabCohortName: eLabCohortNameOf(facts.eLab.currentIteration),
    ventureFundingText: ventureFundingTextOf(facts.eLab.ventureFundingMillions),
  };
}
