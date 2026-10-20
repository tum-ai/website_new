import { type ClockWindow, isClockWindowOpen } from "@/lib/clock-window";
import type { ContentImage } from "@/lib/cms-content-model";
import { parseMunichDateTime } from "@/lib/munich-time";
import { callToActionLabels } from "./calls-to-action";

/** Pure E-Lab facts, application-window shapes and derived phase copy. Values come from CMS settings and windows for each render. */

/** The program: cohort, length, funding, the selection funnel and the logo. */
export type ELabFacts = {
  /** The cohort now running or recruiting, by season and year: "FALL ’26". */
  currentIteration: string;
  /** Cohorts that have run so far; the current one is still ahead. */
  completedCohorts: number;
  /** Weeks from kickoff to Final Pitch: the sum of the /e-lab phases (`programWeeksOf`). */
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
    /** Teams admitted to the cohort (at least this many). */
    admitted: number;
    /** The top of a range of admitted teams ("15–20"), if one is given. */
    admittedUpTo?: number;
    /** Teams picked on Selection Day that pitch their MVP at the Midterm Pitch. */
    midterm: number;
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
   * Munich time, written as shown on the site: "27.09.2026" and "21:00".
   * Applications close at exactly this instant: open at 20:59:59, closed at
   * 21:00:00.
   */
  applicationDeadlineDate: string;
  applicationDeadlineTime: string;
  /**
   * When the next application phase opens ("August"); shown while applications
   * are closed. Absent while no next round is scheduled.
   */
  nextApplicationWindow?: string;
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

/** "12-week equity-free AI startup incubator". */
export function eLabProgramSummaryOf(programWeeks: number): string {
  return `${programWeeks}-week equity-free AI startup incubator`;
}

/**
 * The ventures' funding as every page states it: "€8M+" for 8, "€7.5M+" for
 * 7.5. The only place the figure is formatted, so copy, stats and the ledger
 * cannot drift apart.
 */
export function ventureFundingTextOf(millions: number): string {
  return `€${millions}M+`;
}

/** "ELAB FALL ’26". The program is written ELAB, without a hyphen. */
export function eLabCohortNameOf(currentIteration: string): string {
  return `ELAB ${currentIteration}`;
}

/** "15–20" for a range of teams, else the count alone. */
export function teamCountTextOf(teams: number, upTo?: number): string {
  return upTo && upTo > teams ? `${teams}–${upTo}` : String(teams);
}

/** Copy that is the same in every phase. */
export function eLabApplicationCopyOf(
  currentIteration: string,
  window: ELabApplicationWindow,
) {
  const deadline = `${window.applicationDeadlineDate} at ${window.applicationDeadlineTime}`;
  return {
    cohortName: eLabCohortNameOf(currentIteration),
    /** "27.09.2026 at 21:00", for tight UI such as the status badge. */
    deadline,
    /** "27.09.2026 at 21:00 (Munich time)", for prose such as the FAQ. */
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
  const next = window.nextApplicationWindow;
  const closedStatus = next
    ? `Applications open in ${next}`
    : "Applications closed";
  return {
    /** Short status for teasers elsewhere on the site, e.g. the landing page. */
    teaserStatus: open
      ? `Applications open until ${window.applicationDeadlineDate}`
      : closedStatus,
    /**
     * The apply button's label, or, while closed, the status badge in its
     * place, which says when the next round opens (if one is scheduled).
     */
    ctaLabel: open ? callToActionLabels.apply : closedStatus,
    /** One sentence on where the round stands, e.g. for a closing band. */
    roundStatus: open
      ? `Applications for ${cohortName} close on ${deadline} (Munich time).`
      : next
        ? `Applications for ${cohortName} are closed. The next round opens in ${next}.`
        : `Applications for ${cohortName} are closed. The next round is announced on LinkedIn.`,
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
