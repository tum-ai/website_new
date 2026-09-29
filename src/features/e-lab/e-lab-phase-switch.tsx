"use client";

import type { ReactNode } from "react";
import { eLabApplicationsCloseAt, isELabApplicationOpen } from "@/config/e-lab";
import { useClockSwitch } from "@/lib/use-clock-switch";

/** The one instant the E-Lab phase can change at: the deadline. */
const boundaries = [eLabApplicationsCloseAt];

/**
 * Shows `open` or `closed` for the E-Lab application phase, kept current in
 * the browser (`useClockSwitch`). Server trees use <ELabPhase>, which
 * supplies `initialOpen`; it must equal what the server rendered.
 */
export function ELabPhaseSwitch({
  initialOpen,
  open,
  closed,
}: {
  initialOpen?: boolean;
  open: ReactNode;
  closed: ReactNode;
}) {
  const isOpen = useClockSwitch({
    isOn: isELabApplicationOpen,
    boundaries,
    initial: initialOpen,
  });
  return <>{isOpen ? open : closed}</>;
}
