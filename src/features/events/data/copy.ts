/**
 * The /events page's own copy as code writes it: the code fallback of the
 * `eventsCopy` singleton (see `../content.ts`). The events come from the live
 * dataset; category and semester labels stay in code (they map schema
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

export const eventsCopyTemplate: EventsCopy = {
  hero: {
    emptyLead: "Hackathons, talks and pitch nights in Munich.",
  },
  upcoming: {
    title: "Upcoming",
    // TODO(content): confirm Instagram and LinkedIn are where new event dates go out first.
    empty:
      "Nothing is scheduled right now. We announce new dates on {{instagram}} and {{linkedin}}.",
  },
  past: {
    title: "Past events",
    lead: "Everything we have run since {{since}}, by semester.",
  },
  posters: {
    title: "As announced",
    lead: "The poster of every past event, newest first.",
  },
  closing: {
    title: "TUM.ai x your team.",
    lead: "Bring a challenge to one of our hackathons, give a talk for our members, or host an evening at your office. We plan it with you.",
    studentsReader: "For students",
    nextUp: "Next up:",
    membership:
      "Members plan and run these events themselves, from the first poster to the last pitch.",
  },
};
