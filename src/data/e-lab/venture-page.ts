/** A numeric E-Lab proof point rendered with a count-up animation. */
export interface Metric {
  id: string;
  label: string;
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
}

/** A community quote and the local imagery used to attribute it. */
export interface TestimonialCard {
  id: string;
  name: string;
  role: string;
  context?: string;
  quote: string;
  portraitSrc: string;
  portraitAlt: string;
  organizationLabel: string;
  organizationLogoSrc: string;
  organizationLogoAlt: string;
}

/** One milestone in the E-Lab venture-building program. */
export interface ProgramStep {
  id: string;
  title: string;
  description: string;
}

/** A venture displayed in the notable-startups marquee. */
export interface NotableStartup {
  id: string;
  name: string;
  href: string;
  logoSrc: string;
  logoAlt: string;
  wordmarkLabel?: string;
}

export const eLabMetrics = [
  {
    id: "applications",
    label: "applications per batch",
    from: 0,
    to: 500,
    prefix: "~",
  },
  {
    id: "funding",
    label: "raised by E-Lab ventures",
    from: 0,
    to: 7,
    prefix: "€",
    suffix: "M+",
  },
  {
    id: "iterations",
    label: "E-Lab Iterations",
    from: 0,
    to: 5,
  },
] satisfies readonly Metric[];

export const testimonialCards = [
  {
    id: "leon-hergert",
    name: "Leon Hergert",
    role: "Co-Founder @ Spherecast",
    context: "E-Lab 1.0",
    quote:
      "The E-Lab gave us the foundation to build Spherecast from idea to YC. The community and mentorship were game-changing.",
    portraitSrc: "/assets/e-lab/testimonials/leon_hergert.png",
    portraitAlt: "Portrait of Leon Hergert",
    organizationLabel: "Y Combinator S24",
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
    portraitAlt: "Portrait of Benedikt Wieser",
    organizationLabel: "CDTM Alumni",
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
    portraitAlt: "Portrait of Leonardo Benini",
    organizationLabel: "EWOR Fellow",
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
    portraitAlt: "Portrait of Oliver Schoppe",
    organizationLabel: "UVC Partners",
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
    portraitAlt: "Portrait of Viktor Shen",
    organizationLabel: "Tenmin AI",
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
    portraitAlt: "Portrait of Axel Täubert",
    organizationLabel: "Google Cloud",
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
    portraitAlt: "Portrait of Alexandra Reinert",
    organizationLabel: "Accel",
    organizationLogoSrc: "/assets/e-lab/partners/accel.svg",
    organizationLogoAlt: "Accel logo",
  },
] satisfies readonly TestimonialCard[];

export const programSteps = [
  {
    id: "kickoff",
    title: "Kickoff & Onboarding Weekend",
    description: "3 Days Intensive • Team Alignment & Ideation",
  },
  {
    id: "phase-one",
    title: "Phase I: MVP Build & Foundational Sessions",
    description: "4 Weeks • Rapid Prototyping, Problem-Fit & Core Tech",
  },
  {
    id: "midterm-pitch",
    title: "Midterm Pitch (MVP Gate)",
    description: "Live MVP Demo & Jury Feedback",
  },
  {
    id: "phase-two",
    title: "Phase II: Traction, Iteration & Growth Sessions",
    description: "6 Weeks • User Testing, Go-to-Market, Legal & Pitch Polish",
  },
  {
    id: "selection-day",
    title: "Selection Day",
    description: "Evaluation for Final Showcase",
  },
  {
    id: "final-pitch",
    title: "Final Pitch / Demo Day",
    description: "Investor Pitch & Graduation (July)",
  },
] satisfies readonly ProgramStep[];

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
