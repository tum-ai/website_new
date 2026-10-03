import { type ClockWindow, isClockWindowOpen } from "@/lib/clock-window";
import { munichDayNumber, parseMunichDateTime } from "@/lib/munich-time";

/**
 * Single source for TUM.ai membership recruiting. The Apply page (its
 * important dates, day ruler, actions and FAQ), the header CTA and the home
 * and Community closing bands read it, so a new recruiting round is one edit
 * to `membershipConfig.round`. See "Updating site facts" in
 * docs/contributor-guide.md.
 *
 * `membershipConfig` is the code fallback of the membership
 * `applicationWindow` document (`getMembershipWindow()` in
 * `config/schedule-content.ts`); the helpers below take the resolved config
 * as input, so pages can use the window resolved for a render.
 */

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

export const membershipConfig: MembershipConfig = {
  applicationsOpen: true,
  applicationUrl: "https://tally.so/r/BzWNEK",
  round: {
    // TODO(content): confirm the 2026 round. `opens` is the day the form
    // went live on main (2026-09-28); the other dates repeat the 2025 round's
    // days in 2026 as placeholders, and the name and 23:59 are assumptions.
    name: "Winter semester 2026/27",
    opens: "28.09.2026",
    deadlineDate: "27.10.2026",
    deadlineTime: "23:59",
    interviews: { from: "02.11.2026", to: "08.11.2026" },
    onboarding: { from: "14.11.2026", to: "16.11.2026" },
  },
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

/** The code round's schedule. */
const recruitingSchedule = roundSchedule(membershipConfig.round);

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
  config: MembershipConfig = membershipConfig,
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
  schedule: RoundSchedule = recruitingSchedule,
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
 * October 27th"), for copy that names them: the Apply FAQ and the home and
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

/**
 * {@link recruitingTimelineOf} the code round; per render, derive it from
 * `roundSchedule((await getMembershipWindow()).round)`.
 */
export const recruitingTimeline = recruitingTimelineOf(recruitingSchedule);
