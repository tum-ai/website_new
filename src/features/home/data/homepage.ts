import type { ContentImage } from "@/lib/cms-content-model";

/** A photo with its intrinsic size (for next/image) and a crop focus. */
export type HomePhoto = ContentImage;

/** A photo in the "In the room" spread, with a factual caption. */
export type RoomPhoto = HomePhoto & { key: string; caption: string };

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
     * The member quoted in the join band: a sentence from their story on
     * /community (the member stories), which supplies the name, role and
     * portrait. The CMS reference supplies a stable key for matching the story.
     */
    quote: { key: string; name: string; excerpt: string };
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
