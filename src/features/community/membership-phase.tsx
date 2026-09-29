import type { ReactNode } from "react";
import { isMembershipApplicationOpen } from "@/config/membership";
import { getCmsNow, isCmsClockFixed } from "@/lib/mock-cms-env";
import { MembershipPhaseSwitch } from "./membership-phase-switch";

/**
 * Renders `open` while membership applications are open
 * (`isMembershipApplicationOpen`: the master switch, the form's opening day
 * and the deadline) and `closed` otherwise. The server picks by the render
 * clock (`getCmsNow()`), and the browser switches live when the form opens
 * and at the deadline. Both variants ship with the page, so the switch needs
 * no fetch.
 */
export function MembershipPhase({
  open,
  closed,
}: {
  open: ReactNode;
  closed: ReactNode;
}) {
  return (
    <MembershipPhaseSwitch
      initialOpen={isMembershipApplicationOpen(getCmsNow())}
      live={!isCmsClockFixed()}
      open={open}
      closed={closed}
    />
  );
}
