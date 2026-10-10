import type { CmsFixtureDocument } from "./types";

const photo = {
  src: "/assets/fixtures/photo.svg",
  width: 960,
  height: 640,
  alt: "Example hackathon artwork",
};
/** Two synthetic editions exercise chronology and a shared league match. */
export const hackathonsFixture = {
  hero: {
    eyebrow: "Example hackathons",
    title: "Build together. Join the league.",
    lead: "Building since {{since}}.",
    leagueAction: "Example league",
    makeathonAction: "Example Makeathon",
    ribbonLabel: "Example hackathon timeline",
    sliderLabel: "Timeline",
    nextLabel: "Next",
    legend: {
      makeathon: "Makeathon",
      league: "League match",
      partner: "Other hackathon",
    },
  },
  league: {
    eyebrow: "Example season",
    tagline: "Two matches, one champion.",
    lead: "Teams meet at the season finale.",
    linkLabel: "Learn more",
    routeLabel: "Example season route",
    makeathonDetail: "Our Makeathon",
    partnersTitle: "Example partners",
    finale: {
      label: "Grand Finale",
      text: "The finalists play together.",
      liveLabel: "Live now",
      pastText: "The season is decided.",
      actionLabel: "Follow the finale",
      standingsLabel: "See standings",
      poster: photo,
      championLabel: "Champion",
      runnersUpLabel: "Runners-up",
    },
  },
  makeathon: {
    eyebrow: "Since {{since}}",
    title: "The Makeathon",
    lead: "Build something with your team.",
    linkLabel: "Learn more",
    figures: {
      latest: { value: "10", label: "Example builders" },
      editions: { value: "{{editions}}", label: "Editions since {{since}}" },
      league: { value: "Match 1", label: "Example season opener" },
    },
    editionsTitle: "Every example edition.",
    editionsPhoto: photo,
    editionsPhotoCaption: "Example edition artwork.",
    editions: [
      {
        key: "2025",
        name: "Example Makeathon 2025",
        start: "2025-04-25",
        end: "2025-04-27",
        city: "Munich",
        note: "An example weekend.",
      },
      {
        key: "2026",
        name: "Example Makeathon 2026",
        start: "2026-04-17",
        end: "2026-04-19",
        city: "Munich",
        note: "An example league opener.",
      },
    ],
  },
  partners: {
    title: "Hackathons with partners.",
    lead: "{{count}} since {{since}}.",
    hostsPrefix: "with",
    moreLabel: "More events",
  },
  offer: {
    title: "Bring a challenge.",
    lead: "Give teams a problem to solve.",
    items: ["An example challenge", "Meet the builders"],
    addOns: "Add a workshop.",
  },
  closing: {
    title: "Build at the next one.",
    lead: "Meet your next team.",
    student: {
      audience: "Students",
      text: "Come with a team or join one.",
      actionLabel: "See events",
    },
    partner: { audience: "Partners", text: "Bring your next challenge." },
  },
};

/** Synthetic facts for focused view/geometry tests, separate from published facts. */
export const hackathonsFactsFixture = {
  makeathonUrl: "https://example.com/makeathon",
  league: {
    name: "Example Hackathon League",
    url: "https://example.com/league",
    foundedYear: 2026,
    finaleTeams: 3,
    matches: [
      {
        key: "opener",
        label: "Match 1",
        city: "Munich",
        start: "2026-04-17",
        end: "2026-04-19",
        makeathon: true as const,
      },
      {
        key: "finale",
        makeathon: undefined,
        label: "Grand Finale",
        city: "Munich",
        start: "2026-10-10",
        end: "2026-10-11",
      },
    ],
  },
};
const rawPhoto = {
  _type: "image",
  asset: { _type: "reference", _ref: "fixture-photo" },
  alt: photo.alt,
};
/** Only opt-in mock content and tests import these synthetic documents. */
export const hackathonsFixtureDocuments: CmsFixtureDocument[] = [
  {
    _id: "hackathonsCopy",
    _type: "hackathonsCopy",
    ...hackathonsFixture,
    league: {
      ...hackathonsFixture.league,
      finale: { ...hackathonsFixture.league.finale, poster: rawPhoto },
    },
    makeathon: {
      ...hackathonsFixture.makeathon,
      editionsPhoto: rawPhoto,
      editions: hackathonsFixture.makeathon.editions.map(
        ({ start: _start, end: _end, city: _city, ...edition }) => ({
          ...edition,
          _type: "makeathonEdition",
          _key: edition.key,
          event: {
            _type: "reference",
            _ref: `hackathons-fixture-makeathon-${edition.key}`,
          },
        }),
      ),
    },
  },
  // The editions' events: their dates and city are the editions'.
  ...hackathonsFixture.makeathon.editions.map((edition) => ({
    _id: `hackathons-fixture-makeathon-${edition.key}`,
    _type: "event",
    title: edition.name,
    city: edition.city,
    category: "Hackathon",
    event_date: `${edition.start}T08:00:00Z`,
    end_date: `${edition.end}T16:00:00Z`,
  })),
];

/** Minimal synthetic wording for the events singleton query contract. */
export const eventsCopyFixture = {
  hero: { emptyLead: "Example events for students." },
  upcoming: {
    title: "Upcoming",
    empty: "Look for announcements on {{instagram}} and {{linkedin}}.",
  },
  past: { title: "Past events", lead: "Example events since {{since}}." },
  posters: { title: "Example posters", lead: "A poster gallery." },
  closing: {
    title: "Your team and ours.",
    lead: "Bring an idea to an example event.",
    studentsReader: "Students",
    nextUp: "Next up:",
    membership: "Members help run these events.",
  },
};
hackathonsFixtureDocuments.push({
  _id: "eventsCopy",
  _type: "eventsCopy",
  ...eventsCopyFixture,
});
