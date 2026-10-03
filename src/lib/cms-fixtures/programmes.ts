import type { CmsFixtureDocument } from "./types";

/** Deliberately synthetic page copy, also usable as isolated UI-test input. */
export const projectsCopyFixture = {
  hero: {
    eyebrow: "Task forces",
    title: "Example fields",
    lead: "{{count}} run today.",
    figureLabel: "Choose a field",
  },
  openSeat: { name: "Your field", field: "New field" },
  closing: {
    title: "The open circle",
    lead: "Explore an example field.",
    student: { audience: "For students", text: "Join the example team." },
    partner: {
      audience: "For partners",
      text: "Work with partners such as {{partner}}.",
      textWithoutPartner: "Propose a field.",
    },
  },
};
/** A synthetic optional task force with named work. */
export const taskForcesFixture = [
  {
    slug: "example-field",
    name: "Example team",
    field: "Example science",
    description: "Synthetic project summary.",
    detailedDescription: "Synthetic project details.",
    work: { partner: "Example Company", items: ["Example study"] },
  },
];
/** Synthetic research copy satisfying the required panel and process structure. */
export const researchCopyFixture = {
  hero: { title: "Example research", lead: "Synthetic research description." },
  partnersLabel: "Research partners",
  abstract: {
    label: "Abstract",
    statement: "An example statement.",
    body: "{{running}}.",
    runningOne: "One project is running now",
    runningMany: "{{count}} projects are running now",
  },
  figurePanels: [
    {
      src: "/assets/fixtures/photo.svg",
      width: 960,
      height: 640,
      alt: "Synthetic illustration",
      caption: "Example figure.",
    },
    {
      src: "/assets/fixtures/photo.svg",
      width: 960,
      height: 640,
      alt: "Synthetic illustration",
      caption: "Another example figure.",
    },
  ],
  ongoing: { title: "In progress", empty: "No ongoing projects" },
  completed: { title: "Completed", lead: "Example publications." },
  rex: {
    title: "Research abroad",
    lead: "An example exchange.",
    logosLabel: "Example institutions",
    processTitle: "Example process",
    process: ["Explore a topic", "Review a result"],
    origin: "An example origin.",
  },
  closing: {
    title: "Add a lab",
    openSlot: "Your lab",
    partner: { audience: "For labs", text: "Propose a study." },
    student: { audience: "For students", text: "Join a study." },
  },
};
/** Synthetic finite funnel facts for pure scaling and dot-field tests. */
export const eLabSelectionFixture = {
  applications: 120,
  admitted: 80,
  midterm: 50,
  selectionDay: 30,
  finalPitch: 20,
};
/** Synthetic E-Lab copy with every required gate in funnel order. */
export const eLabCopyFixture = {
  hero: { title: "Example programme", lead: "An example cohort." },
  gates: {
    title: "Example gates",
    lead: "A synthetic funnel.",
    scaleLabel: "Teams",
    stages: [
      {
        kind: "gate" as const,
        figure: "applications" as const,
        name: "Apply",
        description: "Example application.",
      },
      {
        kind: "gate" as const,
        figure: "admitted" as const,
        name: "Start",
        description: "Example admission.",
      },
      {
        kind: "phase" as const,
        id: "example-phase",
        name: "Build",
        description: "Example phase.",
        duration: { amount: 2, unit: "weeks" as const },
      },
      {
        kind: "gate" as const,
        figure: "midterm" as const,
        name: "Review",
        description: "Example review.",
      },
      {
        kind: "gate" as const,
        figure: "selectionDay" as const,
        name: "Select",
        description: "Example selection.",
      },
      {
        kind: "gate" as const,
        figure: "finalPitch" as const,
        name: "Pitch",
        description: "Example pitch.",
      },
    ],
  },
  field: { caption: "Example application field.", inviteLabel: "Your team" },
  ventures: {
    title: "Example venture",
    fundingNote: "Example funding note.",
    logosLabel: "Example ventures",
  },
  voices: {
    title: "Example voices",
    lead: "Example testimonials.",
    foundersLabel: "Founders",
    investorsLabel: "Investors",
  },
  closing: {
    title: "{{applications}} applications",
    followLabel: "Follow the example",
    partnersReader: "For partners",
    partnersText: "Meet example teams.",
  },
};
/** Synthetic city locations and organizations for geographic matching tests. */
export const labSitesFixture = [
  {
    id: "home",
    city: "Example Home",
    location: [48, 11] as [number, number],
    home: true,
    organizations: [
      { key: "example-company", name: "Example Company", shortName: "Example" },
    ],
  },
  {
    id: "remote",
    city: "Example Remote",
    location: [42, -71] as [number, number],
    organizations: [
      { key: "example-lab", name: "Example Lab", shortName: "Lab" },
    ],
  },
];

/** Minimal CMS-shaped documents for the real GROQ projections. */
export const programmesFixtureDocuments: readonly CmsFixtureDocument[] = [
  {
    _id: "eLabCopy",
    _type: "eLabCopy",
    ...eLabCopyFixture,
    gates: {
      ...eLabCopyFixture.gates,
      stages: eLabCopyFixture.gates.stages.map((stage) =>
        stage.kind === "gate"
          ? { ...stage, _type: "gateStage", _key: stage.figure }
          : { ...stage, _type: "phaseStage", _key: stage.id, key: stage.id },
      ),
    },
    voices: {
      ...eLabCopyFixture.voices,
      founders: [
        {
          _type: "reference",
          _key: "founder",
          _ref: "person-e-lab-testimonial-example-founder",
        },
      ],
      investors: [
        {
          _type: "reference",
          _key: "investor",
          _ref: "person-e-lab-testimonial-example-investor",
        },
      ],
    },
  },
  { _id: "projectsCopy", _type: "projectsCopy", ...projectsCopyFixture },
  {
    _id: "task-force-example",
    _type: "taskForce",
    ...taskForcesFixture[0],
    order: 10,
    slug: { _type: "slug", current: "example-field" },
    work: {
      partner: { _type: "reference", _ref: "organization-example-company" },
      items: ["Example study"],
    },
  },
  {
    _id: "researchCopy",
    _type: "researchCopy",
    ...researchCopyFixture,
    figurePanels: researchCopyFixture.figurePanels.map(
      ({ caption, alt }, index) => ({
        _type: "figurePanel",
        _key: `example-${index}`,
        image: {
          _type: "image",
          asset: { _type: "reference", _ref: "fixture-photo" },
          alt,
        },
        caption,
      }),
    ),
  },
  {
    _id: "lab-site-example",
    _type: "labSite",
    key: { _type: "slug", current: "home" },
    city: "Example Home",
    order: 10,
    home: true,
    location: { _type: "geopoint", lat: 48, lng: 11 },
    organizations: [
      {
        _key: "company",
        _type: "reference",
        _ref: "organization-example-company",
      },
    ],
  },
  {
    _id: "faq-e-lab-example",
    _type: "faq",
    collection: "e-lab",
    key: "example",
    order: 10,
    question: "How does the example work?",
    answer: "Explore the example programme.",
  },
];
