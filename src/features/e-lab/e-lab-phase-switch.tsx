"use client";

import type { ReactNode } from "react";
import type { ClockWindow } from "@/lib/clock-window";
import { useClockWindow } from "@/lib/use-clock-switch";

/**
 * Shows `open` or `closed` for the E-Lab application phase, kept current in
 * the browser (`useClockWindow`): it changes at the window's deadline. The
 * window comes from the server (code or CMS) as plain numbers. Server trees
 * use <ELabPhase>, which supplies `initialOpen`; it must equal what the
 * server rendered.
 */
export function ELabPhaseSwitch({
  clock,
  initialOpen,
  live,
  open,
  closed,
}: {
  clock: ClockWindow;
  initialOpen?: boolean;
  /** `false` on a fixed render clock (`MOCK_CMS_NOW`); see `useClockSwitch`. */
  live?: boolean;
  open: ReactNode;
  closed: ReactNode;
}) {
  const isOpen = useClockWindow(clock, { initial: initialOpen, live });
  return <>{isOpen ? open : closed}</>;
}
