import type { SiteFacts } from "@/config/site-facts";
import type { ContentImage } from "@/lib/cms-content-model";
import type { PartnershipFinderCopy } from "./partnership-finder";

/** CMS content models and pure metric helpers shared by the partner page. */

/** The icon beside a reason, mapped to a Lucide icon by the section. */
type PartnerReasonIcon = "users" | "briefcase" | "network";

/** A reason to partner: an icon, a label, a title and a paragraph. */
export type PartnerReason = {
  icon: PartnerReasonIcon;
  name: string;
  title: string;
  description: string;
};

/** A proof figure in the night band's ledger; `value` counts up to its exact text. */
export type PartnerStat = { value: string; label: string; detail?: string };

/** Which pillar a card is; it picks the card's figure. */
export type PartnerPillarKey = "research" | "venture" | "hackathons";

/** The pillar keys, in the code order. */
export const partnerPillarKeys: readonly PartnerPillarKey[] = [
  "research",
  "venture",
  "hackathons",
];

/**
 * Each pillar's headline figure: a site fact, so it is derived from the
 * render's facts (`getSiteFacts()`) rather than written as copy (the
 * hackathon count reads "2500+", without the grouping the
 * `{{impact.hackathonParticipants}}` placeholder has in running text).
 */
export function partnerPillarMetricsOf({
  impact,
  eLab,
}: Pick<SiteFacts, "impact" | "eLab">): Readonly<
  Record<PartnerPillarKey, string>
> {
  return {
    research: `${impact.publications}+`,
    venture: `${eLab.ventureFundingMillions}M+`,
    hackathons: `${impact.hackathonParticipants}+`,
  };
}

/** A pillar card as the page renders it. */
export type PartnerPillar = {
  key: PartnerPillarKey;
  title: string;
  metric: string;
  metricLabel: string;
  description: string;
  image: ContentImage;
  href: string;
};

/** A member profile in the /partners people band ("The cracked …%."). */
export type PartnerProfile = {
  /**
   * The `person` document's key (`partner-profile` placement), fixed so a
   * renamed member stays one document.
   */
  key: string;
  name: string;
  /** The line under the name, "@ organisation" included. */
  role: string;
  /** One line under the role; empty for none. */
  detail: string;
  image: string;
  /** CSS `object-position` of the portrait. */
  position: string;
};

/** A partner case: one measured outcome, its story and a photo. */
export type PartnerCaseStudy = {
  /** CMS document id for editorial references. */
  id: string;
  /** The partner's organisation key (`data/organizations.ts`). */
  organization: string;
  name: string;
  metric: string;
  label: string;
  /** The outcome in a few words, for the homepage ledger. */
  summary: string;
  copy: string;
  /**
   * Who said it, when `copy` is a quote, as they sign; written out whole,
   * since the company part ("BMW Group") can differ from the organisation's
   * name ("BMW").
   */
  attribution?: string;
  image: string;
  alt: string;
  /** CSS `object-position` of the photo. */
  imagePosition: string;
};

/**
 * A heading or lead set on fixed lines: each item is one line, joined with
 * line breaks (the hero title animates line by line).
 */
type Lines = readonly string[];

/**
 * The /partners sections' headings, leads and labels, band by band. The
 * figures in the people band and the buttons' interface labels stay in
 * code; the hero photo and crop are CMS content.
 */
export type PartnersSections = {
  hero: {
    eyebrow: string;
    /** Up to three short lines; each animates in on its own. */
    title: Lines;
    lead: string;
    /** The first button, an email to the partners address. */
    contactLabel: string;
    /** The second button, down to the finder. */
    fitLabel: string;
    /** Over the hero photo. */
    caption: Lines;
    image: ContentImage;
  };
  /** The partner rail under the hero. */
  marquee: { label: string; link: string };
  finder: { eyebrow: string; title: Lines; lead: string; note: string };
  reasons: {
    title: Lines;
    lead: string;
    /** The contact row under the cards. */
    contact: string;
  };
  proof: {
    title: string;
    /** Under the selection field: the drawing in words. Placeholders allowed. */
    caption: string;
  };
  pillars: { title: Lines; lead: string };
  people: {
    title: string;
    lead: Lines;
    /** Under the member count. */
    statLabel: string;
    tagline: Lines;
    alumniTitle: string;
  };
  directory: {
    title: Lines;
    lead: Lines;
    /** Over the supporters' board. */
    supportersTitle: string;
  };
  cases: {
    title: Lines;
    lead: Lines;
    /** The contact row under the cases. */
    contact: string;
  };
  contact: { title: Lines; lead: Lines; emailLabel: string };
};

/** The validated /partners CMS copy as the page renders it. */
export type PartnersCopy = PartnershipFinderCopy & {
  pitch: string;
  reasons: readonly PartnerReason[];
  stats: readonly PartnerStat[];
  pillars: readonly PartnerPillar[];
  sections: PartnersSections;
};
