import type { ContentImage } from "@/lib/cms-content-model";
import { type MakeathonEdition, makeathonEditions } from "./makeathon";

/**
 * The /hackathons page's own copy as code writes it: the code fallback of
 * the `hackathonsCopy` singleton (see `../content.ts`). Text may hold
 * `{{name}}` placeholders for site facts, and the page tokens in
 * `hackathonsPageTokens`, which the page fills from the hackathons it draws.
 * The league's name, season, partners and site are site facts
 * (`config/hackathons.ts`), and the other hackathons are CMS events.
 */
export type HackathonsCopy = {
  hero: {
    eyebrow: string;
    /** One sentence per flagship; each sentence sets on its own line. */
    title: string;
    /** `{{since}}`: the year of the first Makeathon. */
    lead: string;
    /** The button to the league's own site. */
    leagueAction: string;
    /** The button to the Makeathon's own site. */
    makeathonAction: string;
    /** The accessible name of the ribbon's list of hackathons. */
    ribbonLabel: string;
    /** The accessible name of the ribbon's slider (pointer and arrow keys). */
    sliderLabel: string;
    /** Before the next hackathon in the ribbon's readout: "Next". */
    nextLabel: string;
    /** The ribbon's key, one label per kind of mark. */
    legend: { makeathon: string; league: string; partner: string };
  };
  league: {
    /** Over the league's name: who founded it, and when. */
    eyebrow: string;
    /** The season in one line, under the name. */
    tagline: string;
    lead: string;
    /** The button to the league's site. */
    linkLabel: string;
    /** The accessible name of the season's route. */
    routeLabel: string;
    /** Under the match that was a Makeathon. */
    makeathonDetail: string;
    /**
     * The Grand Finale, through its states: to come (poster, countdown),
     * running (`liveLabel`), over (`pastText`, the standings link) and,
     * once editors enter the `champion`, the result with its recap photo.
     */
    finale: {
      /** "Grand Finale". */
      label: string;
      /** While the finale is still to come or running. */
      text: string;
      /** In place of the countdown while the finale runs: "Live now". */
      liveLabel: string;
      /** Once it is over, until the champion is entered. */
      pastText: string;
      /** The link to the league's site before and during the finale. */
      actionLabel: string;
      /** The same link once the finale is over. */
      standingsLabel: string;
      poster: ContentImage;
      /** Over the champion's name: "Season one champion". */
      championLabel: string;
      /** The winning team, entered after the finale. Shows the result. */
      champion?: string;
      /** Before the runners-up: "Runners-up". */
      runnersUpLabel: string;
      /** Second and third place, in order. */
      runnersUp?: string[];
      /** Replaces the poster once the champion is entered. */
      recapPhoto?: ContentImage;
      /** What, where and when the recap photo shows. */
      recapCaption?: string;
    };
    partnersTitle: string;
  };
  makeathon: {
    /** `{{since}}`: the year of the first Makeathon. */
    eyebrow: string;
    title: string;
    lead: string;
    /** The button to the Makeathon's site. */
    linkLabel: string;
    /**
     * The figures beside the opener. `{{editions}}`: the editions so far;
     * `{{since}}`: the year of the first.
     */
    figures: {
      latest: { value: string; label: string };
      editions: { value: string; label: string };
      league: { value: string; label: string };
    };
    /** Over the list of editions. */
    editionsTitle: string;
    /** Beside the list of editions, staying in view while it scrolls. */
    editionsPhoto: ContentImage;
    /** What, where and when the photo shows. */
    editionsPhotoCaption: string;
    /**
     * Every edition, oldest first. Structural: the ribbon draws them as a
     * whole, so a list with any invalid edition falls back to the code list.
     */
    editions: MakeathonEdition[];
  };
  partners: {
    title: string;
    /**
     * `{{count}}`: the other hackathons so far; `{{since}}`: the month of
     * the first.
     */
    lead: string;
    /** Before an event's co-hosts: "with" (… "with BMW and CDTM"). */
    hostsPrefix: string;
    /** Under the latest few, the link to the rest on the events page. */
    moreLabel: string;
  };
  offer: {
    title: string;
    lead: string;
    /** What a challenge partner gets, one line each. */
    items: string[];
    /** The optional extras, one sentence. */
    addOns: string;
  };
  closing: {
    title: string;
    lead: string;
    student: { audience: string; text: string; actionLabel: string };
    partner: { audience: string; text: string };
  };
};

/** The page tokens of the /hackathons copy (see `fillPageTokens`). */
export const hackathonsPageTokens = ["count", "since", "editions"] as const;

export const hackathonsCopyTemplate: HackathonsCopy = {
  hero: {
    eyebrow: "Hackathons by TUM.ai",
    title: "We run the Makeathon. We founded the EHL.",
    lead: "Since {{since}}, {{impact.hackathonParticipants}}+ people have built at our hackathons.",
    leagueAction: "European Hackathon League",
    makeathonAction: "Makeathon",
    ribbonLabel: "Every TUM.ai hackathon, oldest first",
    sliderLabel: "Hackathon timeline",
    nextLabel: "Next",
    legend: {
      makeathon: "Makeathon",
      league: "League match",
      partner: "Other hackathon",
    },
  },
  league: {
    eyebrow: "Founded by TUM.ai in {{league.foundedYear}}",
    tagline:
      "{{league.matchCount}} matches. {{league.cityCount}} cities. One champion.",
    lead: "We built Europe's first competitive hackathon league. Teams score points at every match, the standings follow them across the season, and the top {{league.finaleTeams}} meet in the Grand Finale. Our Makeathon was Match 1.",
    linkLabel: "Learn more",
    routeLabel: "Season one, match by match",
    makeathonDetail: "Our Makeathon",
    finale: {
      label: "Grand Finale",
      text: "The top {{league.finaleTeams}} teams of the season play for the league's first title.",
      liveLabel: "Live now",
      pastText:
        "Season one is decided. The champions and the final standings are on the league's site.",
      actionLabel: "Follow the Grand Finale",
      standingsLabel: "See the final standings",
      poster: {
        src: "/assets/events/hackathons/ehl-2026-grand-finale-poster.webp",
        width: 800,
        height: 800,
        alt: "Our poster for the league's finals in Munich: a silver trophy on violet, with the partners BMW Group, tacto, Atira and Entire",
      },
      championLabel: "Season one champion",
      runnersUpLabel: "Runners-up",
    },
    partnersTitle: "Partners of season one",
  },
  makeathon: {
    eyebrow: "Every year since {{since}}",
    title: "The Makeathon",
    lead: "Our flagship. A weekend in which students and young professionals build AI for problems that companies, hospitals and research labs bring. It is free to take part, and our Makeathon team runs it from start to finish.",
    linkLabel: "Learn more",
    figures: {
      latest: {
        value: "{{community.makeathonSize}}+",
        label: "Builders at the latest edition",
      },
      editions: { value: "{{editions}}", label: "Editions since {{since}}" },
      league: {
        value: "Match 1",
        label: "Opened the European Hackathon League",
      },
    },
    editionsTitle: "Every edition so far.",
    // Source: TUM.ai's post on the 2023 Makeathon (docs/asset-sources/events-hackathons.md).
    editionsPhoto: {
      src: "/assets/events/hackathons/makeathon-2023-group.webp",
      width: 1080,
      height: 1080,
      alt: "Eleven people from the Makeathon smiling around a wooden lectern with a microphone, a camera and studio light beside them",
      objectPosition: "50% 40%",
    },
    editionsPhotoCaption: "At the Makeathon 2023, AI for everyone.",
    editions: [...makeathonEditions],
  },
  partners: {
    title: "Between Makeathons, hackathons with partners.",
    lead: "{{count}} since {{since}}, each on one theme, over a day or a weekend.",
    hostsPrefix: "with",
    moreLabel: "And many more on our events page",
  },
  offer: {
    title: "Bring a challenge.",
    lead: "Partners set the problems our hackathons are built around. At the Makeathon or a league match, a challenge comes with:",
    items: [
      "Your own challenge track",
      "The participant list, CVs included",
      "Your brand on site, and a booth",
      "A company pitch on stage",
    ],
    addOns: "Add a workshop slot, or sponsor the catering.",
  },
  closing: {
    title: "Build at the next one.",
    lead: "Every hackathon is announced on our events page, and the next challenge can be yours.",
    student: {
      audience: "For students",
      text: "Join the next hackathon, with a team or on your own.",
      actionLabel: "See upcoming events",
    },
    partner: {
      audience: "For partners",
      text: "Bring a challenge to the Makeathon, the league or a hackathon of your own.",
    },
  },
};
