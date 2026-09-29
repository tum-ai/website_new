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
  /**
   * How one cohort is selected, gate by gate, from the application round to
   * the Final Pitch. Every figure counts teams (a solo applicant is a team of
   * one), so /e-lab can draw the gates to scale against each other. Each
   * figure is at most the one before it. Update them after each round.
   */
  selection: {
    /** Team applications in one round (about this many). */
    applications: number;
    /** Teams admitted to the cohort. */
    admitted: number;
    /** Teams that pitch their MVP at the Midterm Pitch. */
    midterm: number;
    /** Teams evaluated on Selection Day. */
    selectionDay: number;
    /** Teams that pitch to investors at the Final Pitch. */
    finalPitch: number;
  };
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
  // TODO(content): the 27.09.2026 deadline has passed. The site closes the
  // round by itself at the deadline, but should this switch be set to false
  // (and nextApplicationWindow confirmed) now that E-Lab 6.0 is selected?
  applicationsOpen: true,
  applicationUrl: "https://tally.so/r/xXBkW9",
  applicationDeadlineDate: "27.09.2026",
  applicationDeadlineTime: "22:00",
  nextApplicationWindow: "August",
  programWeeks: 14,
  ventureFundingMillions: 8,
  selection: {
    applications: 500,
    // TODO(content): placeholders. How many teams are admitted, pitch at the
    // Midterm Pitch, are evaluated on Selection Day and pitch at the Final
    // Pitch in a typical cohort? Ask the Venture team.
    admitted: 30,
    midterm: 24,
    selectionDay: 16,
    finalPitch: 10,
  },
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
    /**
     * The apply button's label, or, while closed, the status badge in its
     * place, which says when the next round opens.
     */
    ctaLabel: open
      ? "Apply now"
      : `Applications open in ${eLabConfig.nextApplicationWindow}`,
    /** One sentence on where the round stands, e.g. for a closing band. */
    roundStatus: open
      ? `Applications for ${cohortName} close on ${deadline} (Munich time).`
      : `Applications for ${cohortName} are closed. The next round opens in ${eLabConfig.nextApplicationWindow}.`,
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
