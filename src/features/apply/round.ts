import type { KeyDateItem } from "@tum.ai/ui-kit";
import {
  type ApplicationProgress,
  applicationProgress,
  type MembershipConfig,
  membershipWindowClock,
  type RoundSchedule,
  roundSchedule,
} from "@/config/membership";
import {
  type ClockPhase,
  type ClockWindow,
  clockWindowPhase,
} from "@/lib/clock-window";
import {
  munichDayNumber,
  munichIsoDate,
  munichMidnights,
  nextMunichDate,
  parseMunichDateTime,
} from "@/lib/munich-time";

/** Where the call stands: not yet open, taking applications, or closed. */
export type CallPhase = ClockPhase;

/** Everything /apply shows about the recruiting round at one instant. */
export type RecruitingCall = {
  /**
   * The instant the call describes (epoch ms), so a client island can list
   * the day boundaries still ahead of it ({@link recruitingCallBoundaries}).
   */
  at: number;
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
  /** Words for the copy: "28 September", "25 October", "23:59". */
  words: {
    opens: string;
    deadline: string;
    deadlineTime: string;
    interviews: string;
    onboarding: string;
  };
  /** Short forms for the ruler's labels: "28 Sep", "25 Oct". */
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

/** The days-left label with `daysLeft` calendar days to the deadline day. */
const daysLeftText = (daysLeft: number) =>
  daysLeft === 0 ? "Closes today" : `${days(daysLeft)} left`;

/** "in 5 days", "tomorrow", "today" for a start `count` Munich days away. */
function startsIn(count: number): string {
  if (count <= 0) return "Today";
  if (count === 1) return "Tomorrow";
  return `In ${days(count)}`;
}

/**
 * The recruiting round at `now`: its phase, the register rows with each
 * date's state, and the progress of the application window, all on the
 * Munich calendar. The server passes the render's "now" (`getCmsNow()`) and
 * the window resolved for the render (`await getMembershipWindow()`); the window is required. Isomorphic: the apply page's date islands
 * (`live-call-dates.tsx`) recompute it in the browser with the same window.
 */
export function recruitingCall(
  now: Date,
  config: MembershipConfig,
): RecruitingCall {
  const schedule: RoundSchedule = roundSchedule(config.round);
  const progress = applicationProgress(now, schedule);
  const today = munichDayNumber(now);
  const clock = membershipWindowClock(config);
  const phase: CallPhase = clockWindowPhase(clock, now);

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
  const daysLeftLabel = phase === "open" ? daysLeftText(progress.daysLeft) : "";

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
    at: now.getTime(),
    phase,
    clock,
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

/**
 * The instants from `from` on at which {@link recruitingCall} for `config`
 * can read differently: the opening, the deadline minute, and every Munich
 * midnight up to the one after the round's last date, when every register
 * row has passed. Nothing changes after that.
 */
export function recruitingCallBoundaries(
  from: Date,
  config: MembershipConfig,
): Date[] {
  const { round } = config;
  const { opensAt, closesAt } = roundSchedule(round);
  const lastDate = [
    round.deadlineDate,
    round.interviews.to,
    round.onboarding.to,
  ]
    .map((date) => ({
      date,
      day: munichDayNumber(parseMunichDateTime(date, "00:00")),
    }))
    .reduce((latest, date) => (date.day > latest.day ? date : latest)).date;
  const end = parseMunichDateTime(nextMunichDate(lastDate), "00:00");
  const instants = new Set(
    [opensAt, closesAt]
      .filter((instant) => instant >= from)
      .concat(munichMidnights(from, end))
      .map((instant) => instant.getTime()),
  );
  return [...instants].sort((a, b) => a - b).map((at) => new Date(at));
}

/**
 * `call` as it reads in `phase`, for the variants the page switches between
 * live (<LiveCallPhase>). Only the phase and the days-left label depend on
 * it; a call rendered before the form opens counts the whole window on the
 * opening day.
 */
export function callInPhase(
  call: RecruitingCall,
  phase: CallPhase,
): RecruitingCall {
  const daysLeftLabel =
    phase !== "open"
      ? ""
      : call.daysLeftLabel || daysLeftText(call.progress.totalDays);
  return { ...call, phase, daysLeftLabel };
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
