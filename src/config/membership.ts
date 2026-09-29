import { parseMunichDateTime } from "@/lib/munich-time";

/**
 * Single source for TUM.ai membership recruiting. The Apply page (its
 * important dates, day ruler, actions and FAQ), the header CTA and the home
 * and Community closing bands read it, so a new recruiting round is one edit
 * to `membershipConfig.round`. See "Updating site facts" in
 * docs/contributor-guide.md.
 */

/** A span of whole days in Munich, written "DD.MM.YYYY" like the E-Lab dates. */
export type DateSpan = { from: string; to: string };

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

/** The current round's schedule. */
export const recruitingSchedule = roundSchedule(membershipConfig.round);

/**
 * Whether membership applications are open at `now`: switched on, the form
 * has opened, and the deadline has not passed.
 */
export function isMembershipApplicationOpen(
  now: Date,
  config: MembershipConfig = membershipConfig,
): boolean {
  const { opensAt, closesAt } = roundSchedule(config.round);
  return (
    config.applicationsOpen &&
    now.getTime() >= opensAt.getTime() &&
    now.getTime() < closesAt.getTime()
  );
}

const berlinDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Berlin",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Days since the epoch of the Munich calendar day that contains `instant`. */
export function munichDayNumber(instant: Date): number {
  const [year, month, day] = berlinDay.format(instant).split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86_400_000;
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

const ordinal = (day: number) => {
  const tens = day % 100;
  if (tens >= 11 && tens <= 13) return `${day}th`;
  return `${day}${{ 1: "st", 2: "nd", 3: "rd" }[day % 10] ?? "th"}`;
};

/** "September 28th", in Munich. */
function spoken(instant: Date): string {
  const parts = Object.fromEntries(
    longDate.formatToParts(instant).map((part) => [part.type, part.value]),
  );
  return `${parts.month} ${ordinal(Number(parts.day))}`;
}

/**
 * The round's three phases as sentences' worth of dates ("September 28th -
 * October 27th"), for copy that names them: the Apply FAQ and the home and
 * Community closing bands.
 */
export const recruitingTimeline = {
  application: `${spoken(recruitingSchedule.opensAt)} - ${spoken(recruitingSchedule.closesAt)}`,
  interview: `${spoken(recruitingSchedule.interviews.from)} - ${spoken(recruitingSchedule.interviews.to)}`,
  onboarding: `${spoken(recruitingSchedule.onboarding.from)} - ${spoken(recruitingSchedule.onboarding.to)}`,
} as const;
