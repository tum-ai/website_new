import { parseMunichDateTime } from "@/lib/munich-time";

/**
 * Single source for E-Lab facts: the cohort, the application phase, the
 * deadline and the program length. Every page (the E-Lab page, the landing
 * page's E-Lab card, the FAQ, JSON-LD) derives its copy from here, so a new
 * cohort or phase is one edit in this file. See "Updating site facts" in
 * docs/contributor-guide.md.
 */
export type ELabConfig = {
  currentIteration: string;
  /**
   * Master switch for the application phase. Applications also close by
   * themselves at the deadline instant; set this to `false` to close early or
   * while no round is announced.
   */
  applicationsOpen: boolean;
  applicationUrl: string;
  /**
   * Munich time, written as shown on the site: "27.09.2026" and "22:00".
   * Applications close at exactly this instant: open at 21:59:59, closed at
   * 22:00:00.
   */
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
  applicationsOpen: true,
  applicationUrl: "https://tally.so/r/xXBkW9",
  applicationDeadlineDate: "27.09.2026",
  applicationDeadlineTime: "22:00",
  nextApplicationWindow: "August",
  programWeeks: 14,
  ventureFundingMillions: 8,
  heroLogo: {
    // TODO(content): E-Lab 6.0 still shows the E-Lab 5 artwork. Is there an
    // E-Lab 6 logo, or is the 5.0 lockup intended for this cohort?
    src: "/assets/e-lab/E-Lab5Logo.svg",
    alt: `E-LAB ${currentIteration}`,
  },
};

/** The instant applications close: the deadline itself, in Munich time. */
export const eLabApplicationsCloseAt = parseMunichDateTime(
  eLabConfig.applicationDeadlineDate,
  eLabConfig.applicationDeadlineTime,
);

/** Whether an application window is open at `now`. */
export function isApplicationWindowOpen({
  switchedOn,
  closesAt,
  now,
}: {
  switchedOn: boolean;
  closesAt: Date;
  now: Date;
}): boolean {
  return switchedOn && now.getTime() < closesAt.getTime();
}

/**
 * Whether E-Lab applications are open at `now`. Pages must not cache this in
 * a module constant: render with it (the E-Lab route revalidates) and let
 * <ELabPhase> flip the page live at the deadline.
 */
export function isELabApplicationOpen(now: Date): boolean {
  return isApplicationWindowOpen({
    switchedOn: eLabConfig.applicationsOpen,
    closesAt: eLabApplicationsCloseAt,
    now,
  });
}

/** "14-week equity-free AI startup incubator". */
export const eLabProgramSummary = `${eLabConfig.programWeeks}-week equity-free AI startup incubator`;

/** Cohorts that have run so far: the current one is still ahead. */
export const eLabCompletedIterations =
  Number.parseInt(eLabConfig.currentIteration, 10) - 1;

const cohortName = `E-Lab ${eLabConfig.currentIteration}`;

const deadline = `${eLabConfig.applicationDeadlineDate} at ${eLabConfig.applicationDeadlineTime}`;

/** Copy that is the same in every phase. */
export const eLabApplicationCopy = {
  cohortName,
  /** "27.09.2026 at 22:00", for tight UI such as the status badge. */
  deadline,
  /** "27.09.2026 at 22:00 (Munich time)", for prose such as the FAQ. */
  deadlineLabel: `${deadline} (Munich time)`,
} as const;

function phaseCopy(open: boolean) {
  return {
    /** Short status for teasers elsewhere on the site, e.g. the landing page. */
    teaserStatus: open
      ? `Applications open until ${eLabConfig.applicationDeadlineDate}`
      : `Applications open in ${eLabConfig.nextApplicationWindow}`,
    heroCtaLabel: open
      ? `${cohortName} - Apply Now!`
      : `${cohortName} - Applications Closed`,
    cardHeading: open
      ? `Application for ${cohortName} is open!`
      : `Applications for ${cohortName} are closed!`,
    cardDescription: open
      ? "Secure your spot in one of Europe’s leading AI incubators and join a network of top founders, mentors, and investors."
      : "Applications for this cohort are now closed. Follow TUM.ai for the next intake and upcoming founder opportunities.",
    cardCtaLabel: open ? "Apply Now!" : "Applications Closed",
  } as const;
}

/**
 * Copy for each application phase. Both variants are fixed strings; which one
 * shows is decided at render time by `isELabApplicationOpen`.
 */
export const eLabPhaseCopy = {
  open: phaseCopy(true),
  closed: phaseCopy(false),
} as const;
