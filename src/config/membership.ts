import { type ClockWindow, isClockWindowOpen } from "@/lib/clock-window";
import { munichDayNumber, parseMunichDateTime } from "@/lib/munich-time";

/** Pure membership window shapes, Munich-time schedules and derived recruiting copy. Callers provide the CMS window explicitly. */

/** A span of whole days in Munich, written "DD.MM.YYYY" like the E-Lab dates. */
type DateSpan = { from: string; to: string };

/** One recruiting round, in Munich dates ("DD.MM.YYYY") and time ("HH:MM"). */
export type RecruitingRound = {
  /** Who the round recruits for, e.g. "Winter semester 2026/27". */
  name: string;
  /** The day the application form opens. */
  opens: string;
  /** Last day to apply; applications close at `deadlineTime` on this day. */
  deadlineDate: string;
  /** Closing time on `deadlineDate` ("HH:MM"); applications close at exactly this minute. */
  deadlineTime: string;
  interviews: DateSpan;
  /** The mandatory onboarding weekend. */
  onboarding: DateSpan;
};

export type MembershipConfig = {
  /**
   * Master switch for recruiting. Applications also close by themselves at
   * the round's deadline; set this to `false` to close early or between
   * rounds (the Apply page then shows a disabled button and a closed badge).
   */
  applicationsOpen: boolean;
  applicationUrl: string;
  /** The current (or last) recruiting round. */
  round: RecruitingRound;
};

/** The instants and Munich days of a round, parsed once. */
export type RoundSchedule = {
  opensAt: Date;
  closesAt: Date;
  interviews: { from: Date; to: Date };
  onboarding: { from: Date; to: Date };
};

/** Parses a round's Munich dates. Throws on a malformed date. */
export function roundSchedule(round: RecruitingRound): RoundSchedule {
  const day = (date: string) => parseMunichDateTime(date, "00:00");
  return {
    opensAt: day(round.opens),
    closesAt: parseMunichDateTime(round.deadlineDate, round.deadlineTime),
    interviews: {
      from: day(round.interviews.from),
      to: day(round.interviews.to),
    },
    onboarding: {
      from: day(round.onboarding.from),
      to: day(round.onboarding.to),
    },
  };
}

/**
 * The window as a {@link ClockWindow} for the phase islands and the header:
 * open from Munich midnight on the opening day until the deadline minute,
 * while switched on.
 */
export function membershipWindowClock(config: MembershipConfig): ClockWindow {
  const { opensAt, closesAt } = roundSchedule(config.round);
  return {
    switchedOn: config.applicationsOpen,
    opensAt: opensAt.getTime(),
    closesAt: closesAt.getTime(),
  };
}

/**
 * Whether membership applications are open at `now`: switched on, the form
 * has opened, and the deadline has not passed. `config` defaults to the code
 * window; pass the one resolved for the render (`getMembershipWindow()`).
 */
export function isMembershipApplicationOpen(
  now: Date,
  config: MembershipConfig,
): boolean {
  return isClockWindowOpen(membershipWindowClock(config), now);
}

/** How far the application window has run on the Munich calendar. */
export type ApplicationProgress = {
  /** Calendar days from the opening day to the deadline day. */
  totalDays: number;
  /** Whole days since the opening day, clamped to `0..totalDays`. */
  elapsedDays: number;
  /** Calendar days until the deadline day: 0 on the day itself, negative after. */
  daysLeft: number;
};

/** The application window's progress at `now`, counted in Munich days. */
export function applicationProgress(
  now: Date,
  schedule: RoundSchedule,
): ApplicationProgress {
  const opens = munichDayNumber(schedule.opensAt);
  const closes = munichDayNumber(schedule.closesAt);
  const today = munichDayNumber(now);
  const totalDays = closes - opens;
  return {
    totalDays,
    elapsedDays: Math.min(Math.max(today - opens, 0), totalDays),
    daysLeft: closes - today,
  };
}

const longDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "Europe/Berlin",
  month: "long",
  day: "numeric",
});

const ordinalRules = new Intl.PluralRules("en-US", { type: "ordinal" });
const ordinalSuffix: Record<string, string> = {
  one: "st",
  two: "nd",
  few: "rd",
  other: "th",
};

/** "1st", "22nd", "13th". */
const ordinal = (day: number) =>
  `${day}${ordinalSuffix[ordinalRules.select(day)] ?? "th"}`;

/** "September 28th", in Munich. */
function spoken(instant: Date): string {
  const parts = Object.fromEntries(
    longDate.formatToParts(instant).map((part) => [part.type, part.value]),
  );
  return `${parts.month} ${ordinal(Number(parts.day))}`;
}

/** The round's three phases as sentences' worth of dates. */
export type RecruitingTimeline = {
  readonly application: string;
  readonly interview: string;
  readonly onboarding: string;
};

/**
 * The round's three phases as sentences' worth of dates ("September 28th -
 * October 25th"), for copy that names them: the Apply FAQ and the home and
 * Community closing bands.
 */
export function recruitingTimelineOf(
  schedule: RoundSchedule,
): RecruitingTimeline {
  return {
    application: `${spoken(schedule.opensAt)} - ${spoken(schedule.closesAt)}`,
    interview: `${spoken(schedule.interviews.from)} - ${spoken(schedule.interviews.to)}`,
    onboarding: `${spoken(schedule.onboarding.from)} - ${spoken(schedule.onboarding.to)}`,
  };
}
