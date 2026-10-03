import type { CmsFixtureDocument } from "./types";

const reference = (id: string) => ({ _type: "reference", _ref: id });
const image = (asset: string, alt: string) => ({
  _type: "image",
  asset: reference(asset),
  alt,
});
const logo = image("fixture-logo", "Example Company logo");
const photo = image("fixture-photo", "People at a sample gathering");
const heading = {
  title: ["Build together"],
  lead: ["Explore a sample collaboration."],
};
const format = {
  name: "Sample collaboration",
  description: "Work on a shared project.",
};
const wording = {
  label: "Sample goal",
  shortLabel: "Sample goal",
  detail: "Explore the next step.",
};

/** Small synthetic CMS dataset for independent query/parser contracts. */
export const organizationsFixtureDocuments: CmsFixtureDocument[] = [
  {
    _id: "organization-example-company",
    _type: "organization",
    key: "example-company",
    name: "Example Company",
    href: "https://example.com",
    logo,
    logoOnDark: logo,
    partnerTier: "gold",
    partnerCategory: "Industry Partners",
    partnerFeatured: true,
    partnerOrder: 10,
  },
  {
    _id: "organization-example-venture",
    _type: "organization",
    key: "example-venture",
    name: "Example Venture",
    href: "https://example.com/venture",
    logo,
    logoOnDark: logo,
  },
  {
    _id: "organization-example-venture-two",
    _type: "organization",
    key: "example-venture-two",
    name: "Example Venture Two",
    href: "https://example.com/venture-two",
    logo,
    logoOnDark: logo,
  },
  ...[
    "alumni-destinations",
    "partner-marquee",
    "ehl-partners",
    "rex-institutions",
  ].map((surface) => ({
    _id: `logolist-${surface}`,
    _type: "logoList",
    surface,
    organizations: [
      { _key: "example-company", ...reference("organization-example-company") },
    ],
  })),
  {
    _id: "logolist-e-lab-ventures",
    _type: "logoList",
    surface: "e-lab-ventures",
    organizations: [
      { _key: "example-venture", ...reference("organization-example-venture") },
      {
        _key: "example-venture-two",
        ...reference("organization-example-venture-two"),
      },
    ],
  },
  {
    _id: "person-member-story-example-member",
    _type: "person",
    placement: "member-story",
    key: "example-member",
    order: 10,
    name: "Example Member",
    role: "Project member",
    context: "Sample cohort",
    quote: "I built a small project with the team.",
    story:
      "I built a small project with the team. We learned how to collaborate.",
    portrait: photo,
  },
  {
    _id: "person-partner-profile-example-profile",
    _type: "person",
    placement: "partner-profile",
    key: "example-profile",
    order: 10,
    name: "Example Profile",
    role: "Engineer",
    context: "A sample project",
    portrait: photo,
    organization: reference("organization-example-company"),
    roleAtOrganization: true,
  },
  {
    _id: "person-e-lab-testimonial-example-founder",
    _type: "person",
    placement: "e-lab-testimonial",
    key: "example-founder",
    order: 10,
    name: "Example Founder",
    role: "Founder",
    context: "Sample cohort",
    quote: "The team helped us build our first prototype.",
    portrait: photo,
    organization: reference("organization-example-venture"),
    roleAtOrganization: true,
  },
  {
    _id: "person-e-lab-testimonial-example-investor",
    _type: "person",
    placement: "e-lab-testimonial",
    key: "example-investor",
    order: 20,
    name: "Example Investor",
    role: "Mentor",
    context: "Sample mentor",
    quote: "I enjoyed supporting the founders.",
    portrait: photo,
    organization: reference("organization-example-company"),
    roleAtOrganization: true,
  },
  {
    _id: "caseStudy-example-company",
    _type: "caseStudy",
    organization: reference("organization-example-company"),
    order: 10,
    metric: "1",
    label: "A shared prototype",
    summary: "One sample project completed",
    copy: "The team completed a small prototype.",
    image: photo,
  },
  {
    _id: "ventureTrace",
    _type: "ventureTrace",
    venture: reference("organization-example-venture"),
    person: reference("person-e-lab-testimonial-example-founder"),
    cohort: "Sample cohort",
    now: "builds a sample tool",
    milestones: [
      {
        _key: "prototype",
        text: "A first prototype",
        source: "https://example.com/venture",
      },
    ],
  },
  {
    _id: "partnersCopy",
    _type: "partnersCopy",
    pitch: "Partners support shared projects.",
    intents: {
      talent: {
        ...wording,
        label: "Find builders",
        shortLabel: "Find builders",
      },
      hackathon: {
        ...wording,
        label: "Host a challenge",
        shortLabel: "Host a challenge",
      },
      brand: {
        ...wording,
        label: "Share your work",
        shortLabel: "Share your work",
      },
      research: {
        ...wording,
        label: "Explore research",
        shortLabel: "Explore research",
      },
    },
    durations: {
      oneOff: { ...wording, label: "One activity" },
      ongoing: { ...wording, label: "An ongoing collaboration" },
    },
    recommendations: {
      longTerm: format,
      hackathon: format,
      talent: format,
      brand: format,
      research: format,
    },
    reasons: [
      {
        _key: "talent",
        icon: "users",
        name: "Talent",
        title: "Build together",
        description: "Meet people working on interesting problems.",
      },
    ],
    stats: [
      {
        _key: "members",
        value: "{{org.officialMembers}}",
        label: "Community members",
      },
    ],
    pillars: [
      {
        _key: "research",
        key: "research",
        title: "Research",
        metricLabel: "Publications",
        description: "Explore shared questions.",
        image: photo,
        href: "/research",
      },
    ],
    prompts: {
      intentQuestion: "What would you like to explore?",
      durationQuestion: "How long would you like to collaborate?",
      resultQuestion: "Try {{format}} first.",
      firstChoice: "Start with a conversation.",
      bookingTitle: "Discuss a collaboration",
      bookingLead: "Meet {{host}}.",
      bookingSlow: "Open the booking page to continue.",
    },
    sections: {
      hero: {
        eyebrow: "Build together",
        title: ["Shared ideas"],
        lead: "Explore the community.",
        contactLabel: "Get in touch",
        fitLabel: "Find your fit",
        caption: ["A sample gathering"],
        image: photo,
      },
      marquee: { label: "Our partners", link: "Meet our partners" },
      finder: {
        eyebrow: "Next steps",
        title: ["Find your fit"],
        lead: "Explore a collaboration.",
        note: "Two quick questions.",
      },
      reasons: {
        title: ["Shared goals"],
        lead: "Work with the community.",
        contact: "Start a conversation.",
      },
      proof: {
        title: "A sample community",
        caption: "People come together to build.",
      },
      pillars: { title: ["Shared work"], lead: "Explore different projects." },
      people: {
        title: "Meet the people",
        lead: ["Build together."],
        statLabel: "community members",
        tagline: ["Different ideas"],
        alumniTitle: "Next destinations",
      },
      directory: { ...heading, supportersTitle: "Supporters" },
      cases: { ...heading, contact: "Discuss a project." },
      contact: { ...heading, emailLabel: "Email us" },
    },
  },
];
