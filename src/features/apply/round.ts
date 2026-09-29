import type { KeyDateItem } from "@/components/ds";
import {
  type ApplicationProgress,
  applicationProgress,
  isMembershipApplicationOpen,
  type MembershipConfig,
  membershipConfig,
  membershipWindowClock,
  type RoundSchedule,
  roundSchedule,
} from "@/config/membership";
import type { ClockWindow } from "@/lib/clock-window";
import { munichDayNumber, munichIsoDate } from "@/lib/munich-time";

/** Where the call stands: not yet open, taking applications, or closed. */
export type CallPhase = "upcoming" | "open" | "closed";

/** Everything /apply shows about the recruiting round at one instant. */
export type RecruitingCall = {
  phase: CallPhase;
  /**
   * The application window as instants, for the islands that switch live
   * when the form opens and at the deadline (the apply action).
   */
  clock: ClockWindow;
  /** Who the round recruits for ("Winter semester 2026/27"). */
  name: string;
  /** The application form, for the apply action while the call is open. */
  applicationUrl: string;
  /** The round's dates as the important-dates register rows. */
  keyDates: KeyDateItem[];
  progress: ApplicationProgress;
  /** Words for the copy: "28 September", "27 October", "23:59". */
  words: {
    opens: string;
    deadline: string;
    deadlineTime: string;
    interviews: string;
    onboarding: string;
  };
  /** Short forms for the ruler's labels: "28 Sep", "27 Oct". */
  short: { opens: string; deadline: string };
  /** "26 days left", "1 day left", "Closes today". Empty outside the window. */
  daysLeftLabel: string;
};

const longDate = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Berlin",
  day: "numeric",
  month: "long",
});

const parts = (format: Intl.DateTimeFormat, instant: Date) =>
  Object.fromEntries(
    format.formatToParts(instant).map((part) => [part.type, part.value]),
  );

/**
 * Day and three-letter month in Munich ("28 Sep"). Built from the long
 * name, because en-GB abbreviates September as "Sept".
 */
function shortParts(instant: Date) {
  const { day, month } = parts(longDate, instant);
  return { day, month: month.slice(0, 3) };
}

const shortDate = {
  format: (instant: Date) => {
    const { day, month } = shortParts(instant);
    return `${day} ${month}`;
  },
};

/** "2 - 8 Nov", or "30 Oct - 2 Nov" across a month. */
function shortSpan(from: Date, to: Date): string {
  const start = shortParts(from);
  const end = shortParts(to);
  return start.month === end.month
    ? `${start.day} - ${end.day} ${end.month}`
    : `${start.day} ${start.month} - ${end.day} ${end.month}`;
}

/** "2 to 8 November", for sentences. */
function longSpan(from: Date, to: Date): string {
  const start = parts(longDate, from);
  const end = parts(longDate, to);
  return start.month === end.month
    ? `${start.day} to ${end.day} ${end.month}`
    : `${start.day} ${start.month} to ${end.day} ${end.month}`;
}

const days = (count: number) => `${count} ${count === 1 ? "day" : "days"}`;

/** "in 5 days", "tomorrow", "today" for a start `count` Munich days away. */
function startsIn(count: number): string {
  if (count <= 0) return "Today";
  if (count === 1) return "Tomorrow";
  return `In ${days(count)}`;
}

/**
 * The recruiting round at `now`: its phase, the register rows with each
 * date's state, and the progress of the application window, all on the
 * Munich calendar. Server only: pass the render's "now" (`getCmsNow()`) and
 * the window resolved for the render (`await getMembershipWindow()`); the
 * default is the code window.
 */
export function recruitingCall(
  now: Date,
  config: MembershipConfig = membershipConfig,
): RecruitingCall {
  const schedule: RoundSchedule = roundSchedule(config.round);
  const progress = applicationProgress(now, schedule);
  const today = munichDayNumber(now);
  const open = isMembershipApplicationOpen(now, config);
  const phase: CallPhase = open
    ? "open"
    : now < schedule.opensAt && config.applicationsOpen
      ? "upcoming"
      : "closed";

  const dayAfter = (instant: Date) => munichDayNumber(instant) + 1;
  const rows: (Omit<KeyDateItem, "state"> & {
    /** Munich day number from which the row counts as past. */
    pastFrom: number;
    /** The row has passed once `now` reaches this instant (the deadline). */
    pastAt?: Date;
    startsOn: number;
  })[] = [
    {
      id: "opens",
      label: "Applications open",
      date: shortDate.format(schedule.opensAt),
      dateTime: munichIsoDate(schedule.opensAt),
      pastFrom: munichDayNumber(schedule.opensAt),
      startsOn: munichDayNumber(schedule.opensAt),
    },
    {
      id: "deadline",
      label: "Application deadline",
      detail: `${config.round.deadlineTime}, Munich time`,
      date: shortDate.format(schedule.closesAt),
      dateTime: schedule.closesAt.toISOString(),
      pastFrom: Number.POSITIVE_INFINITY,
      pastAt: schedule.closesAt,
      startsOn: munichDayNumber(schedule.closesAt),
    },
    {
      id: "interviews",
      label: "Interviews",
      date: shortSpan(schedule.interviews.from, schedule.interviews.to),
      dateTime: munichIsoDate(schedule.interviews.from),
      pastFrom: dayAfter(schedule.interviews.to),
      startsOn: munichDayNumber(schedule.interviews.from),
    },
    {
      id: "onboarding",
      label: "Onboarding weekend",
      detail: "Mandatory for new members",
      date: shortSpan(schedule.onboarding.from, schedule.onboarding.to),
      dateTime: munichIsoDate(schedule.onboarding.from),
      pastFrom: dayAfter(schedule.onboarding.to),
      startsOn: munichDayNumber(schedule.onboarding.from),
    },
  ];

  const isPast = (row: (typeof rows)[number]) =>
    row.pastAt ? now >= row.pastAt : today >= row.pastFrom;
  const nextIndex = rows.findIndex((row) => !isPast(row));
  const daysLeftLabel =
    phase !== "open"
      ? ""
      : progress.daysLeft === 0
        ? "Closes today"
        : `${days(progress.daysLeft)} left`;

  const keyDates: KeyDateItem[] = rows.map(
    ({ pastFrom: _from, pastAt: _at, startsOn, ...row }, index) => {
      if (index < nextIndex || nextIndex === -1) {
        return { ...row, state: "past" };
      }
      if (index > nextIndex) return { ...row, state: "upcoming" };
      const note =
        row.id === "deadline"
          ? daysLeftLabel || startsIn(startsOn - today)
          : today >= startsOn
            ? "Now"
            : startsIn(startsOn - today);
      return { ...row, state: "next", note };
    },
  );

  return {
    phase,
    clock: membershipWindowClock(config),
    name: config.round.name,
    applicationUrl: config.applicationUrl,
    keyDates,
    progress,
    words: {
      opens: longDate.format(schedule.opensAt),
      deadline: longDate.format(schedule.closesAt),
      deadlineTime: config.round.deadlineTime,
      interviews: longSpan(schedule.interviews.from, schedule.interviews.to),
      onboarding: longSpan(schedule.onboarding.from, schedule.onboarding.to),
    },
    short: {
      opens: shortDate.format(schedule.opensAt),
      deadline: shortDate.format(schedule.closesAt),
    },
    daysLeftLabel,
  };
}

/** The call's opening sentence for each phase. */
export function callStatus(call: RecruitingCall): string {
  switch (call.phase) {
    case "open":
      return `Applications for the ${call.name.toLowerCase()} are open until ${call.words.deadline}.`;
    case "upcoming":
      return `Applications for the ${call.name.toLowerCase()} open on ${call.words.opens}.`;
    default:
      return `Applications for the ${call.name.toLowerCase()} are closed.`;
  }
}

/** The badge beside the inert apply button while the call isn't open. */
export function closedLabel(call: RecruitingCall): string {
  return call.phase === "upcoming"
    ? `Opens ${call.words.opens}`
    : "Applications closed";
}

/** The closing statement: the one date that matters now. */
export function closingTitle(call: RecruitingCall): string {
  switch (call.phase) {
    case "open":
      return `Applications close on ${call.words.deadline}.`;
    case "upcoming":
      return `Applications open on ${call.words.opens}.`;
    default:
      return "This call is closed.";
  }
}

/** The sentence under it: the time left and what follows the deadline. */
export function closingLead(call: RecruitingCall): string {
  const next = `Interviews run from ${call.words.interviews}, and the onboarding weekend is ${call.words.onboarding}.`;
  if (call.phase === "open") {
    return `${call.daysLeftLabel}. The form closes at ${call.words.deadlineTime}, Munich time. ${next}`;
  }
  if (call.phase === "upcoming") {
    return `The form stays open until ${call.words.deadline}. ${next}`;
  }
  return `${next} The next call will be announced on this page.`;
}
