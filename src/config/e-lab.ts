/**
 * Single source for E-Lab facts: the cohort, whether applications are open,
 * the deadline and the program length. Every page (the E-Lab page, the
 * landing page's E-Lab card, the FAQ, JSON-LD) derives its copy from here, so
 * a new cohort or phase is one edit in this file. See "Updating site facts"
 * in docs/contributor-guide.md.
 */
export type ELabConfig = {
  currentIteration: string;
  applicationsOpen: boolean;
  applicationUrl: string;
  applicationDeadlineDate: string;
  applicationDeadlineTime: string;
  /** When the next application phase opens; shown while applications are closed. */
  nextApplicationWindow: string;
  programWeeks: number;
  /** Money raised by E-Lab ventures, in million euros. */
  ventureFundingMillions: number;
  heroLogo: {
    src: string;
    alt: string;
  };
};

/**
 * Update this when the next E-Lab cohort launches, e.g. "6.0".
 * If the cohort logo changes, update heroLogo at the same time.
 */
const currentIteration = "6.0";

export const eLabConfig: ELabConfig = {
  currentIteration,
  /** Toggle this when applications open or close. */
  applicationsOpen: true,
  applicationUrl: "https://tally.so/r/xXBkW9",
  applicationDeadlineDate: "26.09.2026",
  applicationDeadlineTime: "23:59",
  nextApplicationWindow: "August",
  programWeeks: 14,
  ventureFundingMillions: 8,
  heroLogo: {
    src: "/assets/e-lab/E-Lab5Logo.svg",
    alt: `E-LAB ${currentIteration}`,
  },
};

/** Short status for teasers elsewhere on the site, e.g. the landing page. */
export function getELabTeaserStatus(
  config: Pick<
    ELabConfig,
    "applicationsOpen" | "applicationDeadlineDate" | "nextApplicationWindow"
  >,
): string {
  return config.applicationsOpen
    ? `Applications open until ${config.applicationDeadlineDate}`
    : `Applications open in ${config.nextApplicationWindow}`;
}

/** "14-week equity-free AI startup incubator". */
export const eLabProgramSummary = `${eLabConfig.programWeeks}-week equity-free AI startup incubator`;

/** Cohorts that have run so far: the current one is still ahead. */
export const eLabCompletedIterations =
  Number.parseInt(eLabConfig.currentIteration, 10) - 1;

const cohortName = `E-Lab ${eLabConfig.currentIteration}`;

export const eLabApplicationCopy = {
  cohortName,
  deadline: `${eLabConfig.applicationDeadlineDate} at ${eLabConfig.applicationDeadlineTime}`,
  teaserStatus: getELabTeaserStatus(eLabConfig),
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
