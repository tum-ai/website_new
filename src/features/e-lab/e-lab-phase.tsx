import type { ReactNode } from "react";
import { type ClockWindow, isClockWindowOpen } from "@/lib/clock-window";
import { getCmsNow, isCmsClockFixed } from "@/lib/mock-cms-env";
import { ELabPhaseSwitch } from "./e-lab-phase-switch";

/**
 * Renders `open` while E-Lab applications are open and `closed` afterwards.
 * The server picks by the render clock (`getCmsNow()`, fixed by
 * `MOCK_CMS_NOW` under the mock CMS; the /e-lab route revalidates every few
 * minutes), and the browser switches live at the deadline, except on a
 * fixed clock, where it keeps the server's answer. Both variants ship with the page, so the switch needs no fetch.
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
      initialOpen={isClockWindowOpen(clock, getCmsNow())}
      live={!isCmsClockFixed()}
      open={open}
      closed={closed}
    />
  );
}
