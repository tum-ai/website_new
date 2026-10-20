import type { ContentImage } from "@/lib/cms-content-model";

/**
 * The /hackathons page's published CMS copy (`hackathonsCopy`). Text may hold
 * `{{name}}` placeholders for site facts, and the page tokens in
 * `hackathonsPageTokens`, which the page fills from the hackathons it draws.
 * The league's name and season are CMS site facts, and the other hackathons are CMS events.
 */
export type HackathonsCopy = {
  /** CMS case-study document IDs selected for the optional proof sections. */
  voiceCaseStudy?: string;
  outcomeCaseStudy?: string;
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
     * whole, so a list with any invalid edition fails validation as a whole.
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

/** One complete published edition, ordered chronologically in the singleton. */
export type MakeathonEdition = {
  /** Stable edition key: "2026", "2022-autumn". */
  key: string;
  /** The edition's name as the ledger lists it. */
  name: string;
  /** First day, a Munich calendar date (YYYY-MM-DD). */
  start: string;
  /** Last day, a Munich calendar date (YYYY-MM-DD). */
  end: string;
  /** Where it took place: the city the ribbon matches events by. */
  city: string;
  /** One or two sentences under the name: where, who brought challenges. */
  note: string;
  /** A source worth reading, after the note (a paper, a project gallery). */
  link?: { label: string; href: string };
};
