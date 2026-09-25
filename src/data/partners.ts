import { eLabConfig } from "@/config/e-lab";
import { officialMembers, organizationFacts } from "@/config/organization";

export const partnershipIntents = [
  {
    id: "talent",
    label: "Hiring top AI talent",
    shortLabel: "Hiring top AI talent",
    detail: "Meet your next exceptional hire.",
  },
  {
    id: "hackathon",
    label: "Running a hackathon or challenge",
    shortLabel: "Hackathon challenge",
    detail: "Put a real challenge in brilliant hands.",
  },
  {
    id: "brand",
    label: "Brand visibility in the community",
    shortLabel: "Brand visibility",
    detail: "Be part of the conversation.",
  },
  {
    id: "research",
    label: "A research collaboration",
    shortLabel: "Research collaboration",
    detail: "Explore what comes next, together.",
  },
] as const;

export type PartnershipIntent = (typeof partnershipIntents)[number]["id"];
export type PartnershipDuration = "one-off" | "ongoing";

export const partnershipDurations = [
  {
    id: "one-off",
    label: "A one-off activation",
    detail: "One focused opportunity to make an impact.",
  },
  {
    id: "ongoing",
    label: "An ongoing, strategic relationship",
    detail: "Build a lasting presence across our ecosystem.",
  },
] as const;

export const recommendations = {
  longTerm: {
    name: "Long-Term Partnership",
    description:
      "A year-long relationship across our whole ecosystem, built around your goals. What you can pack into it: curated talent profiles in a dedicated Partner Dashboard and Jobboard access, co-organized events, workshops and exclusive company visits, brand visibility across our LinkedIn, newsletter and major events, and first choice on hackathon slots. Scales from a lightweight setup all the way to founding-partner level.",
  },
  hackathon: {
    name: "Hackathon Participation",
    description:
      "Bring your challenge to one of our hackathons (our signature Makeathon or a European Hackathon League stop in Munich, Berlin, Zurich or Paris). What you can pack into it: your own challenge track, the participant list including CVs, on-site branding and a booth, a company pitch, and optional add-ons like a workshop slot or catering sponsorship.",
  },
  talent: {
    name: "Talent Activation",
    description:
      "The fastest way to get in front of our talent for hiring. What you can pack into it: job postings to our community, access to the CV database, and a targeted mail to the community. Easy to upgrade into a Long-Term Partnership later.",
  },
  brand: {
    name: "Community & Brand Activation",
    description:
      "Put your brand in front of the community where Europe's next AI companies are being built. What you can pack into it: visibility across our 20k+ LinkedIn audience and newsletter, a networking event invitation, and a custom mail to the community.",
  },
  research: {
    name: "Research Collaboration",
    description:
      "Work directly with our research teams and frontier-lab network (MIT, IBM, Cambridge, Harvard). What you can pack into it: shaping the research agenda, joint projects, and a path to NeurIPS, ICML and ICLR publications.",
  },
} as const;

export const partnerReasons = [
  {
    name: "Talent",
    title: "Hire the cracked 2%.",
    description:
      "Curated talent profiles in your dedicated Partner Dashboard, plus access to the TUM.ai Jobboard. Find your next senior engineer or technical co-founder before anyone else.",
  },
  {
    name: "Decision Makers",
    title: "Direct access to future founders & leaders.",
    description:
      "Host exclusive company visits, workshops and co-organized events. Get in front of the people who'll be deciding tool budgets in three years in the fastest-growing industries in Europe.",
  },
  {
    name: "Network & Exposure",
    title: "Your brand, inside the room where AI is built.",
    description:
      "Your brand in front of a 20k+ LinkedIn audience, our newsletter and the major events we run. Consistent visibility across the community where Europe's next AI companies are being built.",
  },
] as const;

export const partnerStats = [
  { value: "2100+", label: "Started applications per batch" },
  { value: "2.3%", label: "Acceptance rate per batch" },
  {
    value: `${officialMembers}+`,
    label: "Official members",
    detail: `${organizationFacts.activeMembers} active, ${organizationFacts.alumni} alumni`,
  },
  {
    value: "1.2M+",
    label: "LinkedIn impressions (last 12 months)",
    detail: "30%+ engagement",
  },
] as const;

export const partnerPillars = [
  {
    title: "Research",
    metric: "5+",
    metricLabel: "Publications",
    description:
      "At top-tier conferences (MIT, Cambridge, Harvard, IBM Research). Collabs with frontier AI labs, path to NeurIPS, ICML and ICLR papers, partners shape the research agenda directly.",
    image: "/assets/homepage/IBM_visit.webp",
    alt: "TUM.ai members visiting IBM",
    href: "/research",
  },
  {
    title: "Venture (E-Lab)",
    metric: `${eLabConfig.ventureFundingMillions}M+`,
    metricLabel: "Raised",
    description:
      "Raised by alumni and counting (YC, EWOR, Spherecast, Mercura, dryft). 25 teams each incubator iteration, alumni backed by YC, EWOR and top VCs, partners join exclusive demo days early.",
    image: "/assets/homepage/venture_onboarding25.webp",
    alt: "TUM.ai E-Lab venture community",
    href: "/e-lab",
  },
  {
    title: "Hackathons",
    metric: "2500+",
    metricLabel: "Hackers",
    description:
      "Over all our hackathons (OpenAI, AWS, Anthropic, Google). 500+ hackers at our signature Makeathon, European Hackathon League across 4 cities (Munich, Berlin, Zurich, Paris), partners host challenges, booths and company pitches.",
    image: "/assets/homepage/Makeathon.webp",
    alt: "The TUM.ai Makeathon team",
    href: "/events",
  },
] as const;

export const partnerProfiles = [
  {
    name: "Leonie Freisinger",
    role: "Co-Founder & CTO @Dryft",
    detail: "5M raised, GC/Neo-backed",
    image: "/assets/partners/people/leonie-portrait.webp",
    position: "56% 35%",
  },
  {
    name: "Mohamed Elrefaie",
    role: "PhD Researcher @MIT",
    detail: "Schwarzman College",
    image: "/assets/partners/people/mohamed-portrait.webp",
    position: "52% 30%",
  },
  {
    name: "Jasmin El-Wafi",
    role: "ML Consultant & Systems Architect @AWS",
    detail: "",
    image: "/assets/partners/people/jasmin-portrait.webp",
    position: "55% 35%",
  },
] as const;

export const partnerCaseStudies = [
  {
    name: "QuantCo",
    metric: "75%",
    label: "From collaboration to colleagues",
    copy: "From one joint project, 3 out of 4 members joined QuantCo full-time. A 75% conversion from collaboration to permanent hires.",
    image: "/assets/partners/cases/quantco.webp",
    alt: "Participants listening to a hackathon presentation",
    imagePosition: "center",
  },
  {
    name: "BMW",
    metric: "48h",
    label: "Real challenges. Tangible results.",
    copy: '"40 of Munich\'s best AI engineers. Some really tangible results. In just 48 hours."',
    attribution: "Manuel, Head of Innovation, BMW Group",
    image: "/assets/partners/cases/bmw.webp",
    alt: "Participants at the BMW and OpenAI hackathon",
    imagePosition: "center",
  },
  {
    name: "Osapiens",
    metric: "20+",
    label: "Applications into the hiring pipeline",
    copy: "One hackathon. 40 competing teams. 20+ applications straight into the hiring pipeline.",
    image: "/assets/partners/cases/osapiens.webp",
    alt: "Hackathon participants collaborating on their laptops",
    imagePosition: "center",
  },
] as const;
