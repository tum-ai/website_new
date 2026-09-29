"use client";

import type { ReactNode } from "react";
import type { ClockPhase, ClockWindow } from "@/lib/clock-window";
import { useClockWindowPhase } from "@/lib/use-clock-switch";

/** Props for {@link MembershipPhaseSwitch}. */
export type MembershipPhaseSwitchProps = {
  /** The membership window, resolved on the server (code or CMS). */
  clock: ClockWindow;
  /** What the server rendered; must match for hydration. */
  initialPhase?: ClockPhase;
  /** `false` on a fixed render clock (`MOCK_CMS_NOW`); see `useClockSwitch`. */
  live?: boolean;
  open: ReactNode;
  closed: ReactNode;
  /** Before the form opens; `closed` when omitted. */
  upcoming?: ReactNode;
};

/**
 * Shows `open` while membership applications are open, `upcoming` before
 * the form opens (when given) and `closed` otherwise, switching live in the
 * browser at both instants. Server trees use <MembershipPhase>, which
 * supplies `initialPhase`.
 */
export function MembershipPhaseSwitch({
  clock,
  initialPhase,
  live,
  open,
  closed,
  upcoming,
}: MembershipPhaseSwitchProps) {
  const phase = useClockWindowPhase(clock, { initial: initialPhase, live });
  if (phase === "open") return <>{open}</>;
  return (
    <>{phase === "upcoming" && upcoming !== undefined ? upcoming : closed}</>
  );
}
