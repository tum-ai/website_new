import type { ReactNode } from "react";
import { type ClockWindow, isClockWindowOpen } from "@/lib/clock-window";
import { ELabPhaseSwitch } from "./e-lab-phase-switch";

/**
 * Renders `open` while E-Lab applications are open and `closed` afterwards.
 * The server picks by its clock at render time (the /e-lab route
 * revalidates every few minutes), and the browser switches live at the
 * deadline. Both variants ship with the page, so the switch needs no fetch.
 * In client-only trees, use <ELabPhaseSwitch> directly.
 *
 * `clock` is the phase resolved for the render:
 * `eLabWindowClock(await getELabWindow())`.
 */
export function ELabPhase({
  clock,
  open,
  closed,
}: {
  clock: ClockWindow;
  open: ReactNode;
  closed: ReactNode;
}) {
  return (
    <ELabPhaseSwitch
      clock={clock}
      initialOpen={isClockWindowOpen(clock, new Date())}
      open={open}
      closed={closed}
    />
  );
}
