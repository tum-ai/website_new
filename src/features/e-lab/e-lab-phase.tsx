import type { ReactNode } from "react";
import { isELabApplicationOpen } from "@/config/e-lab";
import { ELabPhaseSwitch } from "./e-lab-phase-switch";

/**
 * Renders `open` while E-Lab applications are open and `closed` afterwards.
 * The server picks by its clock at render time (the /e-lab route
 * revalidates every few minutes), and the browser switches live at the
 * deadline. Both variants ship with the page, so the switch needs no fetch.
 * In client-only trees, use <ELabPhaseSwitch> directly.
 */
export function ELabPhase({
  open,
  closed,
}: {
  open: ReactNode;
  closed: ReactNode;
}) {
  return (
    <ELabPhaseSwitch
      initialOpen={isELabApplicationOpen(new Date())}
      open={open}
      closed={closed}
    />
  );
}
