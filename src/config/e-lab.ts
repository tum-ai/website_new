import { type ClockWindow, isClockWindowOpen } from "@/lib/clock-window";
import type { ContentImage } from "@/lib/cms-content-model";
import { parseMunichDateTime } from "@/lib/munich-time";
import { callToActionLabels } from "./calls-to-action";

/**
 * Single source for E-Lab facts: the cohort, the application phase, the
 * deadline and the program length. Every page (the E-Lab page, the landing
 * page's E-Lab card, the FAQ, JSON-LD) derives its copy from here, so a new
 * cohort or phase is one edit in this file. See "Updating site facts" in
 * docs/contributor-guide.md.
 *
 * The facts split in two for the CMS: the program facts
 * ({@link ELabFacts}) go to the `siteSettings` document
 * (`config/site-settings-content.ts`), the application phase
 * ({@link ELabApplicationWindow}) to the E-Lab `applicationWindow` document
 * (`config/schedule-content.ts`). `eLabConfig` stays their code fallback;
 * the derived copy below is a function of both, so pages can derive it from
 * the values resolved for a render.
 */

/** The program: cohort, length, funding, the selection funnel and the logo. */
export type ELabFacts = {
  currentIteration: string;
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
  /** The cohort logo; `width` and `height` are the file's intrinsic size. */
  heroLogo: ContentImage;
};

/** The application phase of the current cohort. */
export type ELabApplicationWindow = {
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
};

export type ELabConfig = ELabFacts & ELabApplicationWindow;

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
    width: 2717,
    height: 530,
    alt: `E-LAB ${currentIteration}`,
  },
};

/** The program facts of {@link eLabConfig}: the `siteSettings` code fallback. */
export const eLabFactsFallback: ELabFacts = {
  currentIteration: eLabConfig.currentIteration,
  programWeeks: eLabConfig.programWeeks,
  ventureFundingMillions: eLabConfig.ventureFundingMillions,
  selection: eLabConfig.selection,
  heroLogo: eLabConfig.heroLogo,
};

/** The application phase of {@link eLabConfig}: the `applicationWindow` code fallback. */
export const eLabWindowFallback: ELabApplicationWindow = {
  applicationsOpen: eLabConfig.applicationsOpen,
  applicationUrl: eLabConfig.applicationUrl,
  applicationDeadlineDate: eLabConfig.applicationDeadlineDate,
  applicationDeadlineTime: eLabConfig.applicationDeadlineTime,
  nextApplicationWindow: eLabConfig.nextApplicationWindow,
};

/** The instant applications close: the deadline itself, in Munich time. */
function eLabClosesAt(window: ELabApplicationWindow): Date {
  return parseMunichDateTime(
    window.applicationDeadlineDate,
    window.applicationDeadlineTime,
  );
}

/**
 * The phase as a {@link ClockWindow} for the phase islands: open from the
 * start (E-Lab has no opening date) until the deadline, while switched on.
 */
export function eLabWindowClock(window: ELabApplicationWindow): ClockWindow {
  return {
    switchedOn: window.applicationsOpen,
    opensAt: null,
    closesAt: eLabClosesAt(window).getTime(),
  };
}

/** {@link eLabClosesAt} for the code window. */
export const eLabApplicationsCloseAt = eLabClosesAt(eLabWindowFallback);

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
  return isClockWindowOpen(
    { switchedOn, opensAt: null, closesAt: closesAt.getTime() },
    now,
  );
}

/**
 * Whether E-Lab applications are open at `now` in the code window. Pages
 * must not cache this in a module constant: render with it (the E-Lab route
 * revalidates) and let <ELabPhase> flip the page live at the deadline.
 * Per render, use `isClockWindowOpen(eLabWindowClock(await getELabWindow()), now)`.
 */
export function isELabApplicationOpen(now: Date): boolean {
  return isClockWindowOpen(eLabWindowClock(eLabWindowFallback), now);
}

/** "14-week equity-free AI startup incubator". */
export function eLabProgramSummaryOf(programWeeks: number): string {
  return `${programWeeks}-week equity-free AI startup incubator`;
}

/** Cohorts that have run so far: the current one ("6.0") is still ahead. */
export function eLabCompletedIterationsOf(currentIteration: string): number {
  return Number.parseInt(currentIteration, 10) - 1;
}

/** "E-Lab 6.0". */
export function eLabCohortNameOf(currentIteration: string): string {
  return `E-Lab ${currentIteration}`;
}

/** Copy that is the same in every phase. */
export function eLabApplicationCopyOf(
  currentIteration: string,
  window: ELabApplicationWindow,
) {
  const deadline = `${window.applicationDeadlineDate} at ${window.applicationDeadlineTime}`;
  return {
    cohortName: eLabCohortNameOf(currentIteration),
    /** "27.09.2026 at 22:00", for tight UI such as the status badge. */
    deadline,
    /** "27.09.2026 at 22:00 (Munich time)", for prose such as the FAQ. */
    deadlineLabel: `${deadline} (Munich time)`,
  } as const;
}

function phaseCopy(
  open: boolean,
  currentIteration: string,
  window: ELabApplicationWindow,
) {
  const { cohortName, deadline } = eLabApplicationCopyOf(
    currentIteration,
    window,
  );
  return {
    /** Short status for teasers elsewhere on the site, e.g. the landing page. */
    teaserStatus: open
      ? `Applications open until ${window.applicationDeadlineDate}`
      : `Applications open in ${window.nextApplicationWindow}`,
    /**
     * The apply button's label, or, while closed, the status badge in its
     * place, which says when the next round opens.
     */
    ctaLabel: open
      ? callToActionLabels.apply
      : `Applications open in ${window.nextApplicationWindow}`,
    /** One sentence on where the round stands, e.g. for a closing band. */
    roundStatus: open
      ? `Applications for ${cohortName} close on ${deadline} (Munich time).`
      : `Applications for ${cohortName} are closed. The next round opens in ${window.nextApplicationWindow}.`,
  } as const;
}

/**
 * Copy for each application phase. Both variants are fixed strings; which one
 * shows is decided at render time by the window (<ELabPhase>).
 */
export function eLabPhaseCopyOf(
  currentIteration: string,
  window: ELabApplicationWindow,
) {
  return {
    open: phaseCopy(true, currentIteration, window),
    closed: phaseCopy(false, currentIteration, window),
  } as const;
}

/** {@link eLabProgramSummaryOf} the code facts. */
export const eLabProgramSummary = eLabProgramSummaryOf(eLabConfig.programWeeks);

/** {@link eLabCompletedIterationsOf} the code facts. */
export const eLabCompletedIterations = eLabCompletedIterationsOf(
  eLabConfig.currentIteration,
);

/** {@link eLabApplicationCopyOf} the code facts and window. */
export const eLabApplicationCopy = eLabApplicationCopyOf(
  eLabConfig.currentIteration,
  eLabWindowFallback,
);

/** {@link eLabPhaseCopyOf} the code facts and window. */
export const eLabPhaseCopy = eLabPhaseCopyOf(
  eLabConfig.currentIteration,
  eLabWindowFallback,
);
