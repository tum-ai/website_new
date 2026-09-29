import { organizationByKey } from "@/features/partners";
import type { LogoLists, Organization } from "@/lib/people-and-logos";

/**
 * The /e-lab venture content: the code source of the E-Lab testimonials
 * (`person`, placement `e-lab-testimonial`), the ventures logo list and the
 * `ventureTrace` singleton (`features/e-lab/venture-content.ts`). Logos come
 * from the organisation table (`organizationByKey` in @/features/partners).
 */

/**
 * A community quote and the local imagery used to attribute it. The portrait
 * is decorative (`alt=""`): it always sits beside the person's name.
 */
export interface TestimonialCard {
  id: string;
  name: string;
  role: string;
  context?: string;
  quote: string;
  portraitSrc: string;
  /** CSS `object-position` of the portrait, from the Studio hotspot. */
  portraitPosition?: string;
  organizationLogoSrc: string;
  organizationLogoAlt: string;
}

/** An alumni venture of the E-Lab. */
export interface NotableStartup {
  id: string;
  name: string;
  href: string;
  logoSrc: string;
  logoAlt: string;
  wordmarkLabel?: string;
}

/**
 * A testimonial as code writes it: the organisation the person speaks for
 * by key, whose light logo attributes the quote.
 */
export type Testimonial = Omit<
  TestimonialCard,
  "organizationLogoSrc" | "organizationLogoAlt"
> & { organization: string };

/**
 * A testimonial with its organisation's logo, or `null` when the
 * organisation has no light logo.
 */
function testimonialCardOf(
  { organization: _, ...testimonial }: Testimonial,
  organization: Pick<Organization, "logo">,
): TestimonialCard | null {
  if (!organization.logo) return null;
  return {
    ...testimonial,
    organizationLogoSrc: organization.logo.src,
    organizationLogoAlt: organization.logo.alt,
  };
}

export const testimonials = [
  {
    id: "leon-hergert",
    name: "Leon Hergert",
    role: "Co-Founder @ Spherecast",
    context: "E-Lab 1.0",
    quote:
      "The E-Lab gave us the foundation to build Spherecast from idea to YC. The community and mentorship were game-changing.",
    portraitSrc: "/assets/e-lab/testimonials/leon_hergert.png",
    organization: "y-combinator",
  },
  {
    id: "benedikt-wieser",
    name: "Benedikt Wieser",
    role: "Winner E-Lab 2.0",
    context: "E-Lab 2.0",
    quote:
      "The E-Lab is probably the best program for creating top-end entrepreneurs out there. It's simply incredible.",
    portraitSrc: "/assets/e-lab/testimonials/benedikt_wieser.png",
    organization: "cdtm",
  },
  {
    id: "leonardo-benini",
    name: "Leonardo Benini",
    role: "Founder @ Stealth Startup",
    context: "E-Lab 3.0",
    quote:
      "Structured, fast, and insanely effective. Every founder should experience this.",
    portraitSrc: "/assets/e-lab/testimonials/leonardo_benini.png",
    organization: "ewor",
  },
  {
    id: "oliver-schoppe",
    name: "Oliver Schoppe",
    role: "Principal @ UVC Partners",
    context: "Mentor & Investor",
    quote:
      "The quality of founders coming out of E-Lab is exceptional. We're proud to be part of this community.",
    portraitSrc: "/assets/e-lab/testimonials/oliver_schoppe.png",
    organization: "uvc-partners",
  },
  {
    id: "viktor-shen",
    name: "Viktor Shen",
    role: "Founder of Tenmin",
    context: "E-Lab 3.0",
    quote:
      "We went from zero to being a funded startup - the E-Lab accelerated our journey far beyond what we thought was possible.",
    portraitSrc: "/assets/e-lab/testimonials/viktor_shen.jpeg",
    organization: "tenmin",
  },
  {
    id: "axel-taeubert",
    name: "Axel Täubert",
    role: "Head of Startups @ Google Cloud",
    quote:
      "Truly impressive what the team has built. 🚀 We’re just getting started",
    portraitSrc: "/assets/e-lab/testimonials/axel_taeubert.webp",
    organization: "google-cloud",
  },
  {
    id: "alexandra-reinert",
    name: "Alexandra Reinert",
    role: "Partner @ Accel",
    quote:
      "The density of real builders at the E-Lab Final Pitch is exactly what Tier-1 venture funds look for at the pre-seed stage",
    portraitSrc: "/assets/e-lab/testimonials/alexandra_reinert.webp",
    organization: "accel",
  },
] satisfies readonly Testimonial[];

export const testimonialCards: TestimonialCard[] = testimonials.flatMap(
  (testimonial) =>
    testimonialCardOf(
      testimonial,
      organizationByKey(testimonial.organization),
    ) ?? [],
);

/** The quotes of the /e-lab voices band, by `testimonialCards` id. */
export const eLabVoices = {
  founders: ["viktor-shen", "benedikt-wieser", "leonardo-benini"],
  investors: ["alexandra-reinert", "oliver-schoppe", "axel-taeubert"],
} as const;

/** The E-Lab ventures logo list, in the order the lit dots take them. */
export const eLabLogoLists: LogoLists<"e-lab-ventures"> = {
  "e-lab-ventures": [
    "tenmin",
    "explaino",
    "spherecast",
    "get-ikigai",
    "tau-robotics",
    "helmit",
    "invertix",
  ].map(organizationByKey),
};

/**
 * An organisation as a venture: its key is the id, and symbol-only artwork
 * gets the name set beside it.
 */
export function notableStartupOf({
  key,
  name,
  href,
  logo,
}: Organization): NotableStartup | null {
  if (!href || !logo) return null;
  return {
    id: key,
    name,
    href,
    logoSrc: logo.src,
    logoAlt: logo.alt,
    ...(logo.symbolOnly ? { wordmarkLabel: name } : {}),
  };
}

export const notableStartups: NotableStartup[] = eLabLogoLists[
  "e-lab-ventures"
].flatMap((organization) => notableStartupOf(organization) ?? []);

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
 * The venture /e-lab follows through the gates: an alumni startup, the
 * founder quote that tells its story, the cohort it came from, and what it
 * did after the E-Lab, each milestone from a source the company or YC
 * publishes itself. Ids point into `notableStartups` and `testimonialCards`.
 */
export const tracedVenture: TracedVenture = {
  startupId: "spherecast",
  testimonialId: "leon-hergert",
  // TUM.ai's own post: "one of our earliest startups, originating from AI
  // E-Lab 1.0 ... made it all the way from our E-Lab to the Y Combinator S24
  // Batch" (linkedin.com/posts/tum-ai_tumai-ai-e-lab-graduates-spherecast-
  // activity-7367523700532817920-p2Ff).
  // TODO(content): E-Lab 1.0 may not have had every gate the current program
  // has (Midterm Pitch, Selection Day). Confirm before tracing all of them.
  cohort: "E-Lab 1.0",
  // Spherecast's site: Agnes, "an AI supply chain manager for consumer
  // goods brands" (the second milestone below).
  now: "plans supply chains for consumer brands",
  after: [
    {
      text: "Y Combinator, Summer 2024 batch",
      source: "https://www.ycombinator.com/companies/spherecast",
    },
    {
      text: "Agnes, an AI supply chain manager for consumer goods brands such as AG1",
      source: "https://www.spherecast.ai/",
    },
    {
      text: "Offices in Munich and San Francisco",
      source: "https://www.spherecast.ai/",
    },
    {
      // TODO(content): dated; after September 2026 reword this (past tense,
      // or the next edition) or drop it.
      text: "Sphereworld, its own conference in New York, September 2026",
      source: "https://www.spherecast.ai/sphereworld",
    },
  ],
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
  } = tracedVenture,
): string {
  const next = trace.after[0]?.text.trim();
  const clauses = [
    `${ventureName} came out of ${trace.cohort}`,
    next ? `went on to ${next}` : null,
    trace.now ? `and now ${trace.now}` : null,
  ].filter(Boolean);
  return `${clauses.join(", ")}.`;
}
