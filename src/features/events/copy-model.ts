/**
 * The /events page's published `eventsCopy` singleton. The events come from the
 * `event` documents; category and semester labels stay in code (they map schema
 * values), and so do interface strings such as "Sign up". Some texts hold
 * page tokens the sections fill (`eventsPageTokens`).
 */
export type EventsCopy = {
  hero: {
    /**
     * The hero's lead while no event is listed; otherwise the lead counts
     * the events.
     */
    emptyLead: string;
  };
  upcoming: {
    title: string;
    /**
     * Shown while nothing is scheduled; `{{instagram}}` and `{{linkedin}}`
     * become links to the channels.
     */
    empty: string;
  };
  past: {
    title: string;
    /** `{{since}}`: the month of the first event ("March 2025"). */
    lead: string;
  };
  posters: { title: string; lead: string };
  closing: {
    /** Set as a lockup: " x " joins the names, as on the hero. */
    title: string;
    lead: string;
    studentsReader: string;
    /** Before the next event's title and date. */
    nextUp: string;
    /** Shown instead while nothing is scheduled. */
    membership: string;
  };
};

/** The page tokens of the /events copy (see `fillPageTokens`). */
export const eventsPageTokens = ["instagram", "linkedin", "since"] as const;
