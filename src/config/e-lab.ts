type ELabConfig = {
  currentIteration: string;
  applicationsOpen: boolean;
  applicationUrl: string;
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
  /** Toggle this when applications open or close. */
  applicationsOpen: true,
  applicationUrl: "https://tally.so/r/xXBkW9",
  heroLogo: {
    src: "/assets/e-lab/E-Lab5Logo.svg",
    alt: "E-LAB 6.0",
  },
};

const cohortName = `E-Lab ${eLabConfig.currentIteration}`;

export const eLabApplicationCopy = {
  cohortName,
  heroCtaLabel: eLabConfig.applicationsOpen
    ? `${cohortName} - Apply Now!`
    : `${cohortName} - Applications Closed`,
  cardHeading: eLabConfig.applicationsOpen
    ? `Application for ${cohortName} is open!`
    : `Applications for ${cohortName} are closed!`,
  cardDescription: eLabConfig.applicationsOpen
    ? "Secure your spot in one of Europe’s leading AI incubators and join a network of top founders, mentors, and investors."
    : "Applications for this cohort are now closed. Follow TUM.ai for the next intake and upcoming founder opportunities.",
  cardCtaLabel: eLabConfig.applicationsOpen
    ? "Apply Now!"
    : "Applications Closed",
  ariaLabel: eLabConfig.applicationsOpen
    ? `Apply for ${cohortName}`
    : `${cohortName} applications are closed`,
} as const;
