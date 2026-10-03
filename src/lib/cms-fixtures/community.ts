import type { CmsFixtureDocument } from "./types";

const photo = {
  _type: "image",
  asset: { _type: "reference", _ref: "fixture-photo" },
  alt: "Illustrative fixture scene",
};
const member = {
  _type: "reference",
  _ref: "person-member-story-example-member",
};
const excerpt = "I built a small project with the team.";
const heading = {
  title: "A fixture section",
  lead: "An example introduction for local previews.",
};
const point = {
  _key: "example-point",
  _type: "point",
  title: "An example point",
  text: "A short explanation.",
};

/** Small synthetic CMS documents, independent of the retired site copy. */
export const communityFixtureDocuments: CmsFixtureDocument[] = [
  {
    _id: "communityCopy",
    _type: "communityCopy",
    hero: {
      title: "A student community",
      lead: "A place to work together.",
      photo,
      photoCaption: "An illustrative team scene",
    },
    journey: {
      title: "The member journey",
      lead: "Start together and choose a track.",
    },
    departments: heading,
    stories: {
      title: "Member stories",
      lead: "A member describes their work.",
    },
    closing: {
      title: "Join a team",
      lead: "Read the current application dates.",
      companiesReader: "For organizations",
    },
  },
  {
    _id: "journey-step-example-start",
    _type: "journeyStep",
    order: 10,
    stage: 1,
    number: "01",
    name: "Introduction",
    description: "Meet the team.",
    iconKey: "rocket",
    fromSemester: 0,
    span: "event",
  },
  {
    _id: "journey-step-example-build",
    _type: "journeyStep",
    order: 20,
    stage: 2,
    number: "02A",
    name: "Build track",
    description: "Join a small project. Learn together.",
    iconKey: "brain",
    fromSemester: 1,
    span: "ongoing",
    evidence: { person: member, excerpt },
  },
  {
    _id: "journey-step-example-organize",
    _type: "journeyStep",
    order: 30,
    stage: 2,
    number: "02B",
    name: "Organize track",
    description: "Join a team to organize activities.",
    iconKey: "handshake",
    fromSemester: 1,
    span: "ongoing",
  },
  {
    _id: "department-example",
    _type: "department",
    order: 10,
    name: "Example team",
    description: "A team that organizes sample activities.",
    photo,
    photoCaption: "Illustrative team scene",
  },
  {
    _id: "applyCopy",
    _type: "applyCopy",
    heroTitle: "Applications",
    heroLead: "Read the steps and dates.",
    faqLabel: "Application questions",
    datesTitle: "Dates for {{round}}",
    scope: {
      title: "Who can apply",
      inScopeTitle: "What we seek",
      notRequiredTitle: "No prior experience required",
      valuesTitle: "Working together",
      qualities: [
        point,
        { ...point, _key: "second-quality", title: "Another quality" },
      ],
      notRequired: [point],
      values: [
        point,
        { ...point, _key: "second-value", title: "Another value" },
      ],
      photo,
    },
    tracks: {
      title: "Two tracks",
      lead: "Choose the work you enjoy.",
      offeringsTitle: "Shared activities",
      offerings: [point],
      photo,
      journeyLink: "Read the member journey",
    },
    selection: {
      title: "Selection",
      lead: "{{count}} stages",
      stages: [{ ...point, _type: "selectionStage", when: "deadline" }],
    },
    history: {
      title: "Our milestones",
      lead: "{{count}} milestones across {{years}} years",
    },
    closing: { companiesReader: "For organizations" },
  },
  {
    _id: "milestone-example",
    _type: "milestone",
    order: 10,
    year: 2024,
    kind: "programs",
    title: "An example program",
    detail: "A first local workshop",
  },
  {
    _id: "faq-apply-example",
    _type: "faq",
    collection: "apply",
    order: 10,
    question: "Can I apply?",
    answer: "Read the current call for applications.",
  },
  {
    _id: "homeCopy",
    _type: "homeCopy",
    hero: {
      title: "A place to build",
      lead: "Students learn and work together.",
      partnersLabel: "Example partners",
      photos: [{ ...photo, _key: "hero-photo" }],
    },
    mission: {
      statement: "Learn by building together.",
      body: "A synthetic preview of the initiative.",
    },
    ledger: [
      {
        _key: "members",
        _type: "ledgerRow",
        key: "members",
        label: "Members",
        note: "Active members and alumni",
      },
      {
        _key: "funding",
        _type: "ledgerRow",
        key: "funding",
        label: "Funding",
        note: "Raised by ventures",
      },
      {
        _key: "founded",
        _type: "ledgerRow",
        key: "founded",
        label: "Founded",
        note: "When the initiative started",
      },
    ],
    programs: {
      title: "Our programs",
      lead: "Choose an area to explore.",
      items: [
        {
          _key: "community",
          _type: "program",
          key: "community",
          title: "Community",
          description:
            "Members work in {{departments}} teams with {{rexInstitutions}}.",
          href: "/community",
          image: photo,
        },
      ],
    },
    room: {
      title: "In the room",
      lead: "An illustrative local preview.",
      photos: Array.from({ length: 5 }, (_, index) => ({
        _key: `room-photo-${index}`,
        _type: "roomPhoto",
        image: photo,
        caption: `A sample scene ${index + 1}`,
      })),
    },
    join: {
      title: "Join us",
      lead: "Read the current application call.",
      stepsTitle: "Application steps",
      steps: [
        {
          _key: "apply",
          _type: "recruitingStep",
          title: "Apply",
          dates: "{{recruiting.application}}",
        },
      ],
      quotes: [
        {
          _key: "example-member",
          _type: "memberQuote",
          person: member,
          excerpt,
        },
      ],
    },
    partners: {
      title: "Build with us",
      lead: "Organizations work with members.",
      moreLabel: "About partnerships",
      quote: {
        _type: "reference",
        _ref: "person-e-lab-testimonial-example-founder",
      },
    },
  },
  {
    _id: "qandaCopy",
    _type: "qandaCopy",
    heroTitle: "Questions",
    missionQuestion: "What do members do?",
    missionLead: "The passage answers common questions.",
    missionPassage:
      "Members build small projects and organize useful workshops.",
    closing: {
      title: "Ask a question",
      lead: "Write to the team.",
      action: "Send a question",
    },
    forks: {
      students: { reader: "For students", text: "Read the application page." },
      companies: { reader: "For organizations" },
    },
  },
  {
    _id: "faq-qanda-projects",
    _type: "faq",
    collection: "qanda",
    order: 10,
    anchor: "projects",
    question: "What can I build?",
    answer: "Join a small project.",
    spans: ["build small projects"],
    evidence: {
      text: "An example activity.",
      label: "Explore projects",
      href: "/projects",
    },
  },
  {
    _id: "faq-qanda-workshops",
    _type: "faq",
    collection: "qanda",
    order: 20,
    anchor: "workshops",
    question: "Can I organize workshops?",
    answer: "Work with a team.",
    spans: ["organize useful workshops"],
    points: [],
  },
  {
    _id: "faq-qanda-member-journey",
    _type: "faq",
    collection: "qanda",
    order: 30,
    anchor: "member-journey",
    question: "How does membership work?",
    answer: "Choose a track after the introduction.",
  },
];
