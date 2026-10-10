import type { Organization } from "@/lib/people-and-logos";

/** CMS venture models and pure display helpers. */

/**
 * A community quote and the local imagery used to attribute it. The portrait
 * is decorative (`alt=""`): it always sits beside the person's name.
 */
export interface TestimonialCard {
  id: string;
  name: string;
  /** The line under the name, "@ organisation" included. */
  role: string;
  context?: string;
  quote: string;
  portraitSrc: string;
  /** CSS `object-position` of the portrait, from the Studio hotspot. */
  portraitPosition?: string;
  organizationLogoSrc: string;
  organizationLogoAlt: string;
}

/**
 * An alumni venture of the E-Lab. `href` is its site when the organisation
 * has one (the Studio field is optional); without it the venture still
 * shows, unlinked.
 */
export interface NotableStartup {
  id: string;
  name: string;
  href?: string;
  logoSrc: string;
  logoAlt: string;
  wordmarkLabel?: string;
}

/**
 * An organisation as a venture: its key is the id, and symbol-only artwork
 * gets the name set beside it. `null` only without a light logo: a venture
 * without a website still shows (unlinked), since dropping it would also
 * drop the traced venture and its band.
 */
export function notableStartupOf({
  key,
  name,
  href,
  logo,
}: Organization): NotableStartup | null {
  if (!logo) return null;
  return {
    id: key,
    name,
    ...(href ? { href } : {}),
    logoSrc: logo.src,
    logoAlt: logo.alt,
    ...(logo.symbolOnly ? { wordmarkLabel: name } : {}),
  };
}

/** A milestone of the traced venture after the E-Lab, with its source. */
export interface VentureMilestone {
  text: string;
  /** Where the fact is stated; kept for maintainers, not rendered. */
  source: string;
}

/** The traced venture: ids into the ventures and testimonials, and its path. */
export type TracedVenture = {
  startupId: string;
  testimonialId: string;
  cohort: string;
  /** What the company does today, completing "... and now ...". */
  now?: string;
  after: VentureMilestone[];
};

/**
 * The trace's lead sentence: "Spherecast came out of E-Lab 1.0, went on to
 * Y Combinator, Summer 2024 batch, and now plans supply chains for consumer
 * brands." Clauses without data are left out rather than left empty.
 */
export function tracedVentureLead(
  ventureName: string,
  trace: {
    cohort: string;
    now?: string;
    after: readonly Pick<VentureMilestone, "text">[];
  },
): string {
  const next = trace.after[0]?.text.trim();
  const clauses = [
    `${ventureName} came out of ${trace.cohort}`,
    next ? `went on to ${next}` : null,
    trace.now ? `and now ${trace.now}` : null,
  ].filter(Boolean);
  return `${clauses.join(", ")}.`;
}
