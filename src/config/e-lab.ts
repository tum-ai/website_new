/** Cohort-specific settings shared by the E-Lab page and application CTAs. */
export type ELabConfig = {
  currentIteration: string;
  applicationsOpen: boolean;
  applicationUrl: string;
  /** Closing instant as an ISO 8601 timestamp with explicit offset. */
  applicationDeadline: string;
  /** Human-readable deadline shown in copy such as the FAQ. */
  applicationDeadlineLabel: string;
  heroLogo: {
    src: string;
    alt: string;
  };
};

export const eLabConfig: ELabConfig = {
  /**
   * Update this when the next E-Lab cohort launches, e.g. "6.0".
   * If the cohort logo changes, update heroLogo at the same time.
   */
  currentIteration: "6.0",
  /**
   * Manual master switch. Applications are shown as open only while this is
   * true and applicationDeadline has not passed; the page switches to the
   * closed state in the browser at the deadline without a redeploy.
   */
  applicationsOpen: true,
  applicationUrl: "https://tally.so/r/xXBkW9",
  applicationDeadline: "2026-09-27T21:00:00+02:00",
  applicationDeadlineLabel: "27.09.2026 at 21:00 (Munich time)",
  heroLogo: {
    src: "/assets/e-lab/E-Lab5Logo.svg",
    alt: "E-LAB 6.0",
  },
};

const applicationDeadlineMs = Date.parse(eLabConfig.applicationDeadline);

/** Milliseconds since epoch at which applications close. */
export function getELabApplicationDeadlineMs(): number {
  return applicationDeadlineMs;
}

/** Whether applications are open at the given time. */
export function isELabApplicationOpen(now: number = Date.now()): boolean {
  return eLabConfig.applicationsOpen && now < applicationDeadlineMs;
}

const cohortName = `E-Lab ${eLabConfig.currentIteration}`;

/** Application copy for the given open/closed state. */
export function getELabApplicationCopy(isOpen: boolean) {
  return {
    cohortName,
    deadline: eLabConfig.applicationDeadlineLabel,
    heroCtaLabel: isOpen
      ? `${cohortName} - Apply Now!`
      : `${cohortName} - Applications Closed`,
    cardHeading: isOpen
      ? `Application for ${cohortName} is open!`
      : `Applications for ${cohortName} are closed!`,
    cardDescription: isOpen
      ? "Secure your spot in one of Europe’s leading AI incubators and join a network of top founders, mentors, and investors."
      : "Applications for this cohort are now closed. Follow TUM.ai for the next intake and upcoming founder opportunities.",
    cardCtaLabel: isOpen ? "Apply Now!" : "Applications Closed",
    ariaLabel: isOpen
      ? `Apply for ${cohortName}`
      : `${cohortName} applications are closed`,
  } as const;
}

export type ELabApplicationCopy = ReturnType<typeof getELabApplicationCopy>;
