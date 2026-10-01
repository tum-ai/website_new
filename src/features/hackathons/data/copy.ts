import type { ContentImage } from "@/lib/cms-content-model";
import { type MakeathonEdition, makeathonEditions } from "./makeathon";

/**
 * The /hackathons page's own copy as code writes it: the code fallback of
 * the `hackathonsCopy` singleton (see `../content.ts`). Text may hold
 * `{{name}}` placeholders for site facts, and the page tokens in
 * `hackathonsPageTokens`, which the page fills from the hackathons it draws.
 * The league's season and links are site facts (`config/hackathons.ts`),
 * and the other hackathons are CMS events.
 */
export type HackathonsCopy = {
  hero: {
    eyebrow: string;
    title: string;
    /** `{{since}}`: the year of the first Makeathon. */
    lead: string;
    /** The accessible name of the ribbon's list of hackathons. */
    ribbonLabel: string;
    /** The accessible name of the ribbon's slider (pointer and arrow keys). */
    sliderLabel: string;
    /** Before the next hackathon in the ribbon's readout: "Next". */
    nextLabel: string;
    /** The ribbon's key, one label per kind of mark. */
    legend: { makeathon: string; league: string; partner: string };
  };
  makeathon: {
    /** `{{since}}`: the year of the first Makeathon. */
    title: string;
    lead: string;
    /** The link to the Makeathon's own site. */
    linkLabel: string;
    photo: ContentImage;
    /** What, where and when the photo shows. */
    photoCaption: string;
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
  };
  league: {
    title: string;
    lead: string;
    /** The link to the league's own site. */
    linkLabel: string;
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
export const hackathonsPageTokens = ["count", "since"] as const;

export const hackathonsCopyTemplate: HackathonsCopy = {
  hero: {
    eyebrow: "Hackathons",
    title: "Our hackathons, to scale.",
    // TODO(content): the ribbon's other hackathons start with the CMS events
    // (August 2025); add the earlier ones (OpenAI, AWS, ...) as events.
    lead: "Since {{since}} we have run the Makeathon every year, hackathons with partners in between, and since {{league.foundedYear}} a European league. {{impact.hackathonParticipants}}+ people have built at them.",
    ribbonLabel: "Every TUM.ai hackathon, oldest first",
    sliderLabel: "Hackathon timeline",
    nextLabel: "Next",
    legend: {
      makeathon: "Makeathon",
      league: "League match",
      partner: "Other hackathon",
    },
  },
  makeathon: {
    title: "The Makeathon, every year since {{since}}.",
    lead: "Our flagship. Students and young professionals get a weekend to build AI for problems that companies, hospitals and research labs bring. It is free to take part, and our Makeathon team runs it from start to finish. Over {{community.makeathonSize}} people took part in the latest edition.",
    linkLabel: "Visit the Makeathon site",
    photo: {
      src: "/assets/homepage/Makeathon.webp",
      width: 1920,
      height: 1280,
      alt: "The Makeathon team, in Makeathon shirts and lanyards, on stage in front of the event screen",
      objectPosition: "50% 60%",
    },
    // TODO(content): which edition the photo is from.
    photoCaption: "The Makeathon team on stage.",
    editions: [...makeathonEditions],
  },
  partners: {
    title: "Between Makeathons, hackathons with partners.",
    lead: "{{count}} since {{since}}, each on one theme, over a day or a weekend.",
    hostsPrefix: "with",
  },
  league: {
    title:
      "In {{league.foundedYear}} we founded the European Hackathon League.",
    lead: "Teams score points across a season of hackathons, and the best meet in a Grand Finale. Season one has {{league.matchCount}} matches in {{league.cities}}, and our Makeathon was the first.",
    linkLabel: "Standings and rules",
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
