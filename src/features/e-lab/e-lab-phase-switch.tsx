"use client";

import { type ReactNode, useEffect, useState } from "react";
import { eLabApplicationsCloseAt, isELabApplicationOpen } from "@/config/e-lab";

/** The longest delay setTimeout accepts (about 24.8 days). */
const MAX_TIMEOUT = 2 ** 31 - 1;

/**
 * Whether E-Lab applications are open, kept current in the browser: checked
 * right after mount (the HTML may be a cached render from before the
 * deadline), at the deadline itself, and whenever the tab becomes visible
 * again, because background tabs throttle timers.
 *
 * `initialOpen` must equal what the server rendered, so hydration matches.
 * Omit it in client-only trees; the clock is read on the first render then.
 */
export function useELabApplicationsOpen(initialOpen?: boolean): boolean {
  const [open, setOpen] = useState(
    () => initialOpen ?? isELabApplicationOpen(new Date()),
  );

  useEffect(() => {
    const check = () => setOpen(isELabApplicationOpen(new Date()));
    check();
    const msLeft = eLabApplicationsCloseAt.getTime() - Date.now();
    // A small margin so the check lands after the deadline, never on it.
    const timer =
      msLeft > 0 && msLeft <= MAX_TIMEOUT
        ? window.setTimeout(check, msLeft + 250)
        : undefined;
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, []);

  return open;
}

/**
 * Shows `open` or `closed` for the E-Lab application phase. Server trees use
 * <ELabPhase>, which supplies `initialOpen`.
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
  return <>{useELabApplicationsOpen(initialOpen) ? open : closed}</>;
}
