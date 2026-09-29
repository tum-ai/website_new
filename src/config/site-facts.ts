import { type CommunityFacts, communityFacts } from "./community";
import {
  type ContactEmails,
  contactEmails,
  type PartnershipBooking,
  partnershipContact,
  type SocialLinks,
  socialLinks,
} from "./contact";
import {
  type ELabFacts,
  eLabCohortNameOf,
  eLabCompletedIterationsOf,
  eLabFactsFallback,
  eLabProgramSummaryOf,
} from "./e-lab";
import {
  type ImpactFacts,
  impactFacts,
  publicationVenuesTextOf,
} from "./impact";
import { headerCtaSetting, type LinkedHeaderCtaVariant } from "./navigation";
import {
  brandMission,
  type OrganizationFacts,
  officialMembersOf,
  organizationFacts,
} from "./organization";

/**
 * The site facts editors own: the fields of the CMS `siteSettings`
 * singleton. `getSiteFacts()` (`config/site-settings-content.ts`, server
 * only) resolves them for a render: the CMS document laid over
 * {@link siteFactsFallback}, which is built from the config constants.
 *
 * Out of scope, and kept in code: the legal entity (wording needs the
 * board), the site URL and SEO structure, navigation structure, and the
 * partnership CC addresses (they name people).
 */
export type SiteFacts = {
  organization: OrganizationFacts;
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

/** Today's facts from the config files: what renders without the CMS. */
export const siteFactsFallback: SiteFacts = {
  organization: organizationFacts,
  brandMission,
  impact: impactFacts,
  community: communityFacts,
  contactEmails,
  socialLinks,
  partnershipBooking: {
    bookingUrl: partnershipContact.bookingUrl,
    bookingHost: partnershipContact.bookingHost,
  },
  eLab: eLabFactsFallback,
  footerTagline: "Empowering students to build the future of AI.",
  headerCtaFallback: headerCtaSetting.fallback,
};

/** Values computed from the facts, never stored. */
export type DerivedSiteFacts = {
  /** Active members plus alumni. */
  officialMembers: number;
  /** "NeurIPS, ICML, and ICLR". */
  publicationVenuesText: string;
  /** "12-week equity-free AI startup incubator". */
  eLabProgramSummary: string;
  /** Cohorts that have run so far (the current one is still ahead). */
  eLabCompletedIterations: number;
  /** "E-Lab 6.0". */
  eLabCohortName: string;
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
  };
}
