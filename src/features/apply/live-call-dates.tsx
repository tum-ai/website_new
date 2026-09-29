"use client";

import { useCallback, useMemo } from "react";
import { DayRuler, KeyDates } from "@/components/ds";
import type { MembershipConfig } from "@/config/membership";
import { useClockState } from "@/lib/use-clock-switch";
import {
  type RecruitingCall,
  recruitingCall,
  recruitingCallBoundaries,
} from "./round";

/** Props shared by the apply page's date islands. */
type LiveCallDatesProps = {
  /** The server's call (`recruitingCall(now, config)`): the first render, so hydration matches. */
  call: RecruitingCall;
  /** The membership window the server computed `call` from (`await getMembershipWindow()`). */
  config: MembershipConfig;
  /**
   * `false` keeps the server's call: on a fixed render clock
   * (`!isCmsClockFixed()` on the server, `MOCK_CMS_NOW` in E2E and visual
   * runs).
   */
  live?: boolean;
};

/**
 * The server's call, kept current in the browser: recomputed at the
 * opening, the deadline, every Munich midnight until the round's dates
 * have all passed, and whenever the tab becomes visible again. /apply is
 * served from an hourly cache and may stay open for days, so the day
 * counts ("In 3 days", "Closes today"), the next date and the ruler's
 * elapsed days would otherwise keep the day of the render.
 */
function useLiveCall({ call, config, live }: LiveCallDatesProps) {
  const at = useCallback((now: Date) => recruitingCall(now, config), [config]);
  const boundaries = useMemo(
    () => recruitingCallBoundaries(new Date(call.at), config),
    [call.at, config],
  );
  return useClockState({ at, boundaries, initial: call, live });
}

const startLabel = (call: RecruitingCall) =>
  `${call.phase === "upcoming" ? "Opens" : "Opened"} ${call.short.opens}`;

const endLabel = (call: RecruitingCall) => `Deadline ${call.short.deadline}`;

/**
 * The hero's dates: the register of the round's important dates over a
 * ruler of the application window's days, marked "Today" while open. Kept
 * current in the browser (see `useLiveCall`).
 */
export function LiveHeroDates({
  labelledBy,
  ...props
}: LiveCallDatesProps & {
  /** id of the register's title. */
  labelledBy: string;
}) {
  const call = useLiveCall(props);
  return (
    <>
      <KeyDates
        items={call.keyDates}
        aria-labelledby={labelledBy}
        drawIn
        className="mt-4"
      />
      <DayRuler
        className="mt-8"
        days={call.progress.totalDays}
        elapsed={call.progress.elapsedDays}
        startLabel={startLabel(call)}
        endLabel={endLabel(call)}
        markLabel={call.phase === "open" ? "Today" : undefined}
        drawIn
      />
    </>
  );
}

/**
 * The closing band's full-width ruler, its mark labelled with the days left
 * while open. Kept current in the browser (see `useLiveCall`).
 */
export function LiveClosingRuler(props: LiveCallDatesProps) {
  const call = useLiveCall(props);
  return (
    <DayRuler
      className="mt-12 md:mt-16"
      size="lg"
      days={call.progress.totalDays}
      elapsed={call.progress.elapsedDays}
      startLabel={startLabel(call)}
      endLabel={endLabel(call)}
      markLabel={call.daysLeftLabel || undefined}
    />
  );
}
