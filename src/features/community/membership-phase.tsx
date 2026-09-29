import type { ReactNode } from "react";
import { type ClockWindow, clockWindowPhase } from "@/lib/clock-window";
import { getCmsNow, isCmsClockFixed } from "@/lib/mock-cms-env";
import { MembershipPhaseSwitch } from "./membership-phase-switch";

/**
 * Renders `open` while the membership application window is open (the
 * master switch, the form's opening day and the deadline), `upcoming`
 * (when given) before the form opens, and `closed` otherwise. The server picks by the render clock (`getCmsNow()`), and the
 * browser switches live when the form opens and at the deadline. Both
 * variants ship with the page, so the switch needs no fetch.
 *
 * `clock` is the round resolved for the render:
 * `membershipWindowClock(await getMembershipWindow())`.
 */
export function MembershipPhase({
  clock,
  open,
  closed,
  upcoming,
}: {
  clock: ClockWindow;
  open: ReactNode;
  closed: ReactNode;
  /** Before the form opens; `closed` when omitted. */
  upcoming?: ReactNode;
}) {
  return (
    <MembershipPhaseSwitch
      clock={clock}
      initialPhase={clockWindowPhase(clock, getCmsNow())}
      live={!isCmsClockFixed()}
      open={open}
      closed={closed}
      upcoming={upcoming}
    />
  );
}
