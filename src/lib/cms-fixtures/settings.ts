import type { CmsFixtureDocument } from "./types";

/** Small synthetic settings, deliberately unrelated to production content. */
export const settingsFixtureFacts = {
  organization: {
    foundingYear: 2022,
    activeMembers: 12,
    alumni: 18,
    majors: 3,
    universities: 2,
    nationalities: 4,
    acceptanceRate: 10,
    startedApplicationsPerBatch: 100,
    linkedinAudience: 1200,
  },
  brandMission: "Build and learn together.",
  impact: {
    publications: 2,
    publicationVenues: ["Fixture Conference"],
    hackathonParticipants: 40,
  },
  community: { makeathonSize: 20 },
  contactEmails: {
    general: "contact@example.org",
    partners: "partners@example.org",
    venture: "venture@example.org",
    recruitment: "recruitment@example.org",
  },
  socialLinks: {
    linkedin: "https://example.org/linkedin",
    instagram: "https://example.org/instagram",
    github: "https://example.org/github",
    x: "https://example.org/x",
    youtube: "https://example.org/youtube",
    facebook: "https://example.org/facebook",
    tiktok: "https://example.org/tiktok",
    slack: "https://example.org/slack",
  },
  partnershipBooking: {
    bookingUrl: "https://cal.eu/fixture/intro",
    bookingHost: "Fixture host",
  },
  eLab: {
    currentIteration: "2.0",
    programWeeks: 8,
    ventureFundingMillions: 1,
    selection: {
      applications: 20,
      admitted: 10,
      midterm: 8,
      selectionDay: 6,
      finalPitch: 4,
    },
    heroLogo: {
      src: "/assets/tum_ai_logo_new.svg",
      width: 1640,
      height: 406,
      alt: "Fixture cohort",
    },
  },
  footerTagline: "Synthetic local fixture.",
  headerCtaFallback: "partner" as const,
  hackathons: {
    makeathonUrl: "https://example.org/makeathon",
    league: {
      name: "Fixture league",
      url: "https://example.org/league",
      foundedYear: 2025,
      finaleTeams: 4,
      matches: [
        {
          key: "fixture-match",
          label: "Fixture match",
          city: "Munich",
          start: "2026-10-10",
          end: "2026-10-11",
          makeathon: true as const,
        },
      ],
    },
  },
};
export const settingsFixtureMembership = {
  applicationsOpen: true,
  applicationUrl: "https://example.org/apply",
  round: {
    name: "Fixture round",
    opens: "01.10.2026",
    deadlineDate: "20.10.2026",
    deadlineTime: "20:00",
    interviews: { from: "21.10.2026", to: "23.10.2026" },
    onboarding: { from: "24.10.2026", to: "25.10.2026" },
  },
};
export const settingsFixtureELabWindow = {
  applicationsOpen: true,
  applicationUrl: "https://example.org/startup",
  applicationDeadlineDate: "20.10.2026",
  applicationDeadlineTime: "20:00",
  nextApplicationWindow: "spring",
};
export const settingsFixtureDocuments: CmsFixtureDocument[] = [
  {
    _id: "settings-fixture-logo",
    _type: "sanity.imageAsset",
    url: settingsFixtureFacts.eLab.heroLogo.src,
    metadata: { dimensions: { width: 1640, height: 406 } },
  },
  {
    _id: "settings-fixture-match",
    _type: "event",
    title: "Fixture match",
    city: "Munich",
    category: "Hackathon",
    event_date: "2026-10-10T10:00:00Z",
    end_date: "2026-10-11T10:00:00Z",
  },
  {
    _id: "siteSettings",
    _type: "siteSettings",
    ...settingsFixtureFacts,
    eLab: {
      ...settingsFixtureFacts.eLab,
      heroLogo: {
        _type: "image",
        asset: { _type: "reference", _ref: "settings-fixture-logo" },
        alt: "Fixture cohort",
      },
    },
    hackathons: {
      ...settingsFixtureFacts.hackathons,
      league: {
        ...settingsFixtureFacts.hackathons.league,
        matches: [
          {
            _key: "fixture-match",
            key: "fixture-match",
            label: "Fixture match",
            makeathon: true as const,
            event: { _type: "reference", _ref: "settings-fixture-match" },
          },
        ],
      },
    },
  },
  {
    _id: "applicationwindow-membership",
    _type: "applicationWindow",
    program: "membership",
    roundName: "Fixture round",
    switchedOn: true,
    opens: "2026-10-01",
    deadlineDate: "2026-10-20",
    deadlineTime: "20:00",
    applicationUrl: "https://example.org/apply",
    milestones: [
      { key: "interviews", from: "2026-10-21", to: "2026-10-23" },
      { key: "onboarding", from: "2026-10-24", to: "2026-10-25" },
    ],
  },
  {
    _id: "applicationwindow-e-lab",
    _type: "applicationWindow",
    program: "e-lab",
    switchedOn: true,
    deadlineDate: "2026-10-20",
    deadlineTime: "20:00",
    applicationUrl: "https://example.org/startup",
    nextWindowLabel: "spring",
  },
];
