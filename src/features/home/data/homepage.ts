import type { ContentImage } from "@/lib/cms-content-model";

/**
 * The homepage's copy as code writes it: the code fallback of the `homeCopy`
 * singleton (see `../content.ts`). Text may hold `{{name}}` placeholders for
 * site facts, filled on the server, and page tokens (`homePageTokens`) the
 * page fills from other content. The ledger's figures are the site facts
 * (`../home-view.ts`); the quotes pick a person by key or name, and the
 * person supplies the rest.
 */

/** A photo with its intrinsic size (for next/image) and a crop focus. */
export type HomePhoto = ContentImage;

/** A photo in the "In the room" spread, with a factual caption. */
export type RoomPhoto = HomePhoto & { caption: string };

/** The figures of the ledger, by key; their values come from the config. */
export const ledgerKeys = [
  "founded",
  "members",
  "nationalities",
  "funding",
  "makeathon",
  "publications",
] as const;

export type LedgerKey = (typeof ledgerKeys)[number];

/** One of the five ways into TUM.ai on the program index. */
type HomeProgram = {
  /** Stable key. */
  id: string;
  title: string;
  /** One sentence with one concrete proof point. */
  description: string;
  /** The page it leads to. */
  href: string;
  /** Decorative: the title names the row. */
  image: HomePhoto;
};

export type HomeCopy = {
  hero: {
    title: string;
    lead: string;
    /** The label before the partners' logos. */
    partnersLabel: string;
    /** Photos seen through the logomark, in order. Decorative. */
    photos: HomePhoto[];
  };
  mission: { statement: string; body: string };
  /** The ledger beside the mission statement: which figures, in order. */
  ledger: { key: LedgerKey; label: string; note: string }[];
  programs: { title: string; lead: string; items: HomeProgram[] };
  room: { title: string; lead: string; photos: RoomPhoto[] };
  join: {
    title: string;
    lead: string;
    stepsTitle: string;
    /** The recruiting round in order; the dates are placeholders. */
    steps: { title: string; dates: string }[];
    /**
     * The members quoted in the join band, in the order of their faces; the
     * first is quoted until a visitor picks another face. Each excerpt is a
     * sentence from that member's story on /community (the member stories),
     * which supplies the name, role and portrait. In the CMS, `name` is a
     * reference to that story's person.
     */
    quotes: { name: string; excerpt: string }[];
  };
  /** The partner band: the case for partners, their quote, the partner wall. */
  partners: {
    title: string;
    lead: string;
    /** The second button's label, to /partners. */
    moreLabel: string;
    /**
     * The venture partner quoted for the partner audience: the key of an
     * E-Lab testimonial (a `person` reference in the CMS).
     */
    quote: string;
  };
};

/**
 * The page tokens of the homepage copy (see `fillPageTokens`):
 * `{{rexInstitutions}}` lists the REX institutions' short names, and
 * `{{departments}}` spells how many departments /community lists.
 */
export const homePageTokens = ["rexInstitutions", "departments"] as const;

/**
 * Photos seen through the logomark in the hero, in order. Stage-lit rooms
 * read best through the narrow strokes.
 *
 * TODO(content): replace with three photos at least 2880px wide from one
 * shoot (OpenAI talk, E-Lab Demo Day, Makeathon); these are 1920px.
 */
export const heroPhotos: HomePhoto[] = [
  {
    src: "/assets/open_ai_speaker_event.webp",
    width: 1920,
    height: 1280,
    alt: "",
    objectPosition: "62% 50%",
  },
  {
    src: "/assets/homepage/elab.webp",
    width: 1920,
    height: 1440,
    alt: "",
    objectPosition: "50% 40%",
  },
  {
    src: "/assets/homepage/Makeathon.webp",
    width: 1920,
    height: 1280,
    alt: "",
    objectPosition: "50% 45%",
  },
];

export const homeCopyTemplate: HomeCopy = {
  hero: {
    title: "Germany’s leading AI student initiative.",
    lead: "We are {{org.activeMembers}}+ students from {{org.universities}}+ universities who publish research, build AI products with industry and found startups. In Munich since {{org.foundingYear}}.",
    partnersLabel: "Partners include",
    photos: heroPhotos,
  },
  mission: {
    statement:
      "We close the gap between AI research and the things people build.",
    body: "TUM.ai is a non-profit student initiative at the Technical University of Munich. Our members run research projects with universities and labs, build AI products with industry partners, incubate startups, and host hackathons, talks and workshops.",
  },
  ledger: [
    {
      key: "founded",
      label: "Founded",
      note: "At the Technical University of Munich",
    },
    {
      key: "members",
      label: "Members",
      note: "{{org.activeMembers}}+ active and {{org.alumni}}+ alumni",
    },
    {
      key: "nationalities",
      label: "Nationalities",
      note: "Across {{org.majors}}+ majors and {{org.universities}}+ universities",
    },
    {
      key: "funding",
      label: "Raised by E-Lab startups",
      note: "Across {{eLab.completedCohorts}} incubator cohorts",
    },
    {
      key: "makeathon",
      label: "Makeathon",
      note: "Builders at our signature hackathon",
    },
    {
      key: "publications",
      label: "Publications",
      note: "Including {{impact.publicationVenues}}",
    },
  ],
  programs: {
    title: "What we do",
    lead: "Every program is organized by members, together with partners from research and industry.",
    items: [
      {
        id: "research",
        title: "Research",
        description:
          "Research projects with universities and labs, papers at {{impact.publicationVenues}}, and exchanges with {{rexInstitutions}}.",
        href: "/research",
        image: {
          src: "/assets/innovation/robotics_discussion.webp",
          width: 1920,
          height: 1440,
          alt: "",
        },
      },
      {
        id: "entrepreneurship",
        title: "Entrepreneurship",
        description:
          "The AI E-Lab, our equity-free incubator. Its startups have raised €{{eLab.ventureFundingMillions}}M so far.",
        href: "/e-lab",
        image: {
          src: "/assets/homepage/elab.webp",
          width: 1920,
          height: 1440,
          alt: "",
          objectPosition: "50% 40%",
        },
      },
      {
        id: "events",
        title: "Hackathons and events",
        description:
          "Talks with OpenAI and NVIDIA, hands-on workshops, and a Makeathon that draws {{community.makeathonSize}}+ builders.",
        href: "/events",
        image: {
          src: "/assets/open_ai_speaker_event.webp",
          width: 1920,
          height: 1280,
          alt: "",
          objectPosition: "65% 50%",
        },
      },
      {
        id: "projects",
        title: "Projects",
        description:
          "Task forces on medical AI, quantum computing and generative models, and Women@TUM.ai.",
        href: "/projects",
        image: {
          src: "/assets/innovation/women_at_tumai.jpg",
          width: 2430,
          height: 1620,
          alt: "",
        },
      },
      {
        id: "community",
        title: "Community",
        description:
          "{{org.activeMembers}}+ active members in {{departments}} departments, who run all of the above themselves.",
        href: "/community",
        image: {
          src: "/assets/homepage/Onboarding25.webp",
          width: 1920,
          height: 1280,
          alt: "",
        },
      },
    ],
  },
  room: {
    title: "In the room",
    lead: "Talks in packed auditoriums, hackathons that run through the night, and first pitches in front of investors.",
    /*
     * The editorial photo spread, in layout order (see ROOM_CELLS).
     *
     * TODO(content): confirm the event names and years in these captions.
     */
    photos: [
      {
        src: "/assets/open_ai_speaker_event.webp",
        width: 1920,
        height: 1280,
        alt: "A speaker from OpenAI on stage in front of a full auditorium",
        caption: "OpenAI Deutschland at TUM.ai, 2025",
      },
      {
        src: "/assets/homepage/elab.webp",
        width: 1920,
        height: 1440,
        alt: "A keynote at the AI E-Lab in a packed brick hall",
        caption: "AI E-Lab kickoff",
      },
      {
        src: "/assets/apply/new_section_photo_4.webp",
        width: 1920,
        height: 668,
        alt: "A packed lecture hall watching a team pitch",
        caption: "Challenge pitches in a full lecture hall",
      },
      {
        src: "/assets/homepage/Makeathon.webp",
        width: 1920,
        height: 1280,
        alt: "The Makeathon organizing team on stage",
        caption: "The Makeathon team on stage",
      },
      {
        src: "/assets/innovation/robotics_discussion.webp",
        width: 1920,
        height: 1440,
        alt: "Members building robot arms at a whiteboard",
        caption: "Robotics task force at work",
      },
    ],
  },
  join: {
    title: "Build the future of AI with us.",
    lead: "We recruit new members every semester, from every major. Join {{org.activeMembers}}+ students who run research, startups and hackathons themselves.",
    stepsTitle: "How a recruiting round runs",
    steps: [
      { title: "Apply", dates: "{{recruiting.application}}" },
      { title: "Interview", dates: "{{recruiting.interview}}" },
      { title: "Onboarding", dates: "{{recruiting.onboarding}}" },
    ],
    // Only Sami chose his sentence; the others are placeholder picks from
    // their stories until they choose their own (#315).
    quotes: [
      {
        name: "Sami Haddouti",
        excerpt:
          "The breadth of responsibilities and leadership opportunities here is truly unmatched.",
      },
      {
        name: "Jasmin El-Wafi",
        excerpt:
          "Being part of such an ambitious and intelligent community inspires learning, aiming high, and building lasting friendships.",
      },
      {
        name: "Zexin Gong",
        excerpt:
          "Being part of this community not only enhanced my technical, leadership, and project management skills, but also helped me forge incredible friendships.",
      },
      {
        name: "Xabier Irizar",
        excerpt:
          "TUM.ai helped me immensely in expanding my horizons of what is possible to do during university.",
      },
      {
        name: "Simon Huang",
        excerpt:
          "Within one semester at TUM.ai, I went from joining the software development team to leading a group of seven.",
      },
      {
        name: "Marco Lorenz",
        excerpt:
          "The inspiring people I met at TUM.ai have motivated me to pursue new opportunities and push my own ambitions further.",
      },
    ],
  },
  partners: {
    title: "Partners who build with us",
    lead: "Research labs, scale-ups and global technology companies work with TUM.ai to meet talent, set real challenges and back new ventures.",
    moreLabel: "How partnerships work",
    quote: "alexandra-reinert",
  },
};
