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

export const testimonialCards = [
  {
    id: "leon-hergert",
    name: "Leon Hergert",
    role: "Co-Founder @ Spherecast",
    context: "E-Lab 1.0",
    quote:
      "The E-Lab gave us the foundation to build Spherecast from idea to YC. The community and mentorship were game-changing.",
    portraitSrc: "/assets/e-lab/testimonials/leon_hergert.png",
    organizationLogoSrc: "/assets/e-lab/partners/y-combinator.webp",
    organizationLogoAlt: "Y Combinator logo",
  },
  {
    id: "benedikt-wieser",
    name: "Benedikt Wieser",
    role: "Winner E-Lab 2.0",
    context: "E-Lab 2.0",
    quote:
      "The E-Lab is probably the best program for creating top-end entrepreneurs out there. It's simply incredible.",
    portraitSrc: "/assets/e-lab/testimonials/benedikt_wieser.png",
    organizationLogoSrc: "/assets/e-lab/partners/cdtm.webp",
    organizationLogoAlt: "CDTM logo",
  },
  {
    id: "leonardo-benini",
    name: "Leonardo Benini",
    role: "Founder @ Stealth Startup",
    context: "E-Lab 3.0",
    quote:
      "Structured, fast, and insanely effective. Every founder should experience this.",
    portraitSrc: "/assets/e-lab/testimonials/leonardo_benini.png",
    organizationLogoSrc: "/assets/e-lab/partners/ewor.webp",
    organizationLogoAlt: "EWOR logo",
  },
  {
    id: "oliver-schoppe",
    name: "Oliver Schoppe",
    role: "Principal @ UVC Partners",
    context: "Mentor & Investor",
    quote:
      "The quality of founders coming out of E-Lab is exceptional. We're proud to be part of this community.",
    portraitSrc: "/assets/e-lab/testimonials/oliver_schoppe.png",
    organizationLogoSrc: "/assets/e-lab/partners/uvc-partners.webp",
    organizationLogoAlt: "UVC Partners logo",
  },
  {
    id: "viktor-shen",
    name: "Viktor Shen",
    role: "Founder of Tenmin",
    context: "E-Lab 3.0",
    quote:
      "We went from zero to being a funded startup - the E-Lab accelerated our journey far beyond what we thought was possible.",
    portraitSrc: "/assets/e-lab/testimonials/viktor_shen.jpeg",
    organizationLogoSrc: "/assets/e-lab/startups/Tenmin.svg",
    organizationLogoAlt: "Tenmin AI logo",
  },
  {
    id: "axel-taeubert",
    name: "Axel Täubert",
    role: "Head of Startups @ Google Cloud",
    quote:
      "Truly impressive what the team has built. 🚀 We’re just getting started",
    portraitSrc: "/assets/e-lab/testimonials/axel_taeubert.webp",
    organizationLogoSrc: "/assets/e-lab/partners/google.svg",
    organizationLogoAlt: "Google logo",
  },
  {
    id: "alexandra-reinert",
    name: "Alexandra Reinert",
    role: "Partner @ Accel",
    quote:
      "The density of real builders at the E-Lab Final Pitch is exactly what Tier-1 venture funds look for at the pre-seed stage",
    portraitSrc: "/assets/e-lab/testimonials/alexandra_reinert.webp",
    organizationLogoSrc: "/assets/e-lab/partners/accel.svg",
    organizationLogoAlt: "Accel logo",
  },
] satisfies readonly TestimonialCard[];

/** The quotes of the /e-lab voices band, by `testimonialCards` id. */
export const eLabVoices = {
  founders: ["viktor-shen", "benedikt-wieser", "leonardo-benini"],
  investors: ["alexandra-reinert", "oliver-schoppe", "axel-taeubert"],
} as const;

export const notableStartups = [
  {
    id: "tenmin",
    name: "Tenmin",
    href: "https://tenmin.ai/",
    logoSrc: "/assets/e-lab/startups/Tenmin.svg",
    logoAlt: "Tenmin logo",
  },
  {
    id: "explaino",
    name: "Explaino",
    href: "https://explaino.ai/",
    logoSrc: "/assets/e-lab/startups/LogoExplaino.svg",
    logoAlt: "Explaino logo",
  },
  {
    id: "spherecast",
    name: "Spherecast",
    href: "https://www.spherecast.ai/",
    logoSrc: "/assets/e-lab/startups/Spherecast.webp",
    logoAlt: "Spherecast logo",
  },
  {
    id: "get-ikigai",
    name: "Get Ikigai",
    href: "https://www.get-ikigai.com/",
    logoSrc: "/assets/e-lab/startups/get-ilkigai.svg",
    logoAlt: "Get Ikigai logo",
  },
  {
    id: "tau-robotics",
    name: "Tau Robotics",
    href: "https://www.tau-robotics.com/",
    logoSrc: "/assets/e-lab/startups/TauRobotics.svg",
    logoAlt: "Tau Robotics logo",
    wordmarkLabel: "Tau Robotics",
  },
  {
    id: "helmit",
    name: "Helmit",
    href: "https://www.helmit.org/",
    logoSrc: "/assets/e-lab/startups/helmit.svg",
    logoAlt: "Helmit logo",
  },
  {
    id: "invertix",
    name: "Invertix",
    href: "https://www.invertix.ai/",
    logoSrc: "/assets/e-lab/startups/invertix.webp",
    logoAlt: "Invertix logo",
    wordmarkLabel: "Invertix",
  },
] satisfies readonly NotableStartup[];

/** A milestone of the traced venture after the E-Lab, with its source. */
export interface VentureMilestone {
  text: string;
  /** Where the fact is stated; kept for maintainers, not rendered. */
  source: string;
}

/**
 * The venture /e-lab follows through the gates: an alumni startup, the
 * founder quote that tells its story, the cohort it came from, and what it
 * did after the E-Lab, each milestone from a source the company or YC
 * publishes itself. Ids point into `notableStartups` and `testimonialCards`.
 */
export const tracedVenture = {
  startupId: "spherecast",
  testimonialId: "leon-hergert",
  // TUM.ai's own post: "one of our earliest startups, originating from AI
  // E-Lab 1.0 ... made it all the way from our E-Lab to the Y Combinator S24
  // Batch" (linkedin.com/posts/tum-ai_tumai-ai-e-lab-graduates-spherecast-
  // activity-7367523700532817920-p2Ff).
  // TODO(content): E-Lab 1.0 may not have had every gate the current program
  // has (Midterm Pitch, Selection Day). Confirm before tracing all of them.
  cohort: "E-Lab 1.0",
  /** What the company does today, completing "... and now ...". */
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
} satisfies {
  startupId: string;
  testimonialId: string;
  cohort: string;
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
