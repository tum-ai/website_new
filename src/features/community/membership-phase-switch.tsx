"use client";

import type { ReactNode } from "react";
import type { ClockWindow } from "@/lib/clock-window";
import { useClockWindow } from "@/lib/use-clock-switch";

/** Props for {@link MembershipPhaseSwitch}. */
export type MembershipPhaseSwitchProps = {
  /** The membership window, resolved on the server (code or CMS). */
  clock: ClockWindow;
  /** What the server rendered; must match for hydration. */
  initialOpen?: boolean;
  /** `false` on a fixed render clock (`MOCK_CMS_NOW`); see `useClockSwitch`. */
  live?: boolean;
  open: ReactNode;
  closed: ReactNode;
};

/**
 * Shows `open` while membership applications are open and `closed` before
 * the form opens and after the deadline, switching live in the browser at
 * both instants. Server trees use <MembershipPhase>, which supplies
 * `initialOpen`.
 */
export function MembershipPhaseSwitch({
  clock,
  initialOpen,
  live,
  open,
  closed,
}: MembershipPhaseSwitchProps) {
  const isOpen = useClockWindow(clock, { initial: initialOpen, live });
  return <>{isOpen ? open : closed}</>;
}
