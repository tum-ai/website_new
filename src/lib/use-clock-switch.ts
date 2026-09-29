import { useEffect, useState } from "react";

/** The longest delay setTimeout accepts (about 24.8 days). */
const MAX_TIMEOUT = 2 ** 31 - 1;

/** Lands the re-check just after a boundary instant, never on it. */
const BOUNDARY_MARGIN_MS = 250;

/** Input for {@link useClockSwitch}. */
export type ClockSwitchOptions = {
  /**
   * Whether the switch is on at an instant, e.g. an application window.
   * Must be a stable reference (a module-level function).
   */
  isOn: (now: Date) => boolean;
  /**
   * The instants at which `isOn` can change (a window's opening and
   * closing). Must be a stable reference (a module-level constant).
   */
  boundaries: readonly Date[];
  /**
   * What the server rendered, so hydration matches. Omit it in client-only
   * trees; the clock is read on the first render then.
   */
  initial?: boolean;
  /**
   * `false` keeps the server's answer: for renders pinned to a fixed clock
   * (`MOCK_CMS_NOW` in E2E and visual runs), where the browser's real clock
   * would disagree with the page.
   */
  live?: boolean;
};

/**
 * A yes/no state that depends on the clock, kept current in the browser:
 * checked right after mount (the HTML may be a cached render from before a
 * boundary), at each upcoming boundary, and whenever the tab becomes
 * visible again, because background tabs throttle timers.
 */
export function useClockSwitch({
  isOn,
  boundaries,
  initial,
  live = true,
}: ClockSwitchOptions): boolean {
  const [on, setOn] = useState(() => initial ?? isOn(new Date()));

  useEffect(() => {
    if (!live) return;
    let timer: number | undefined;
    const check = () => {
      const now = Date.now();
      setOn(isOn(new Date(now)));
      window.clearTimeout(timer);
      const next = Math.min(
        ...boundaries.map((at) => at.getTime()).filter((at) => at > now),
      );
      const delay = next - now + BOUNDARY_MARGIN_MS;
      timer =
        Number.isFinite(next) && delay <= MAX_TIMEOUT
          ? window.setTimeout(check, delay)
          : undefined;
    };
    check();
    document.addEventListener("visibilitychange", check);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", check);
    };
  }, [isOn, boundaries, live]);

  return on;
}
