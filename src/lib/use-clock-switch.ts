import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ClockWindow,
  clockWindowBoundaries,
  isClockWindowOpen,
} from "./clock-window";

/** The longest delay setTimeout accepts (about 24.8 days). */
const MAX_TIMEOUT = 2 ** 31 - 1;

/** Lands the re-check just after a boundary instant, never on it. */
const BOUNDARY_MARGIN_MS = 250;

/** Input for {@link useClockState}. */
export type ClockStateOptions<T> = {
  /**
   * The value at an instant, e.g. which call to action a schedule shows.
   * Must be a stable reference (a module-level function or a memoized one).
   */
  at: (now: Date) => T;
  /**
   * The instants at which `at` can change (a window's opening and
   * closing). Must be a stable reference (a module-level constant or a
   * memoized list).
   */
  boundaries: readonly Date[];
  /**
   * What the server rendered, so hydration matches. Omit it in client-only
   * trees; the clock is read on the first render then.
   */
  initial?: T;
  /**
   * `false` keeps the server's answer: for renders pinned to a fixed clock
   * (`MOCK_CMS_NOW` in E2E and visual runs), where the browser's real clock
   * would disagree with the page.
   */
  live?: boolean;
};

/**
 * A value that depends on the clock, kept current in the browser: computed
 * right after mount (the HTML may be a cached render from before a
 * boundary), at each upcoming boundary, and whenever the tab becomes
 * visible again, because background tabs throttle timers.
 */
export function useClockState<T>({
  at,
  boundaries,
  initial,
  live = true,
}: ClockStateOptions<T>): T {
  const [value, setValue] = useState<T>(() =>
    initial === undefined ? at(new Date()) : initial,
  );

  useEffect(() => {
    if (!live) return;
    let timer: number | undefined;
    const check = () => {
      const now = Date.now();
      setValue(at(new Date(now)));
      window.clearTimeout(timer);
      const next = Math.min(
        ...boundaries
          .map((instant) => instant.getTime())
          .filter((instant) => instant > now),
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
  }, [at, boundaries, live]);

  return value;
}

/** Input for {@link useClockSwitch}. */
export type ClockSwitchOptions = Omit<ClockStateOptions<boolean>, "at"> & {
  /**
   * Whether the switch is on at an instant, e.g. an application window.
   * Must be a stable reference (a module-level function).
   */
  isOn: (now: Date) => boolean;
};

/** {@link useClockState} for a yes/no state, such as an open window. */
export function useClockSwitch({
  isOn,
  ...options
}: ClockSwitchOptions): boolean {
  return useClockState({ at: isOn, ...options });
}

/**
 * Whether a {@link ClockWindow} is open, kept current in the browser. The
 * window arrives as a prop from a server component; its fields are compared
 * by value, so a new object with the same instants does not restart the
 * timers.
 */
export function useClockWindow(
  clock: ClockWindow,
  options: Pick<ClockStateOptions<boolean>, "initial" | "live"> = {},
): boolean {
  const { switchedOn, opensAt, closesAt } = clock;
  const isOn = useCallback(
    (now: Date) => isClockWindowOpen({ switchedOn, opensAt, closesAt }, now),
    [switchedOn, opensAt, closesAt],
  );
  const boundaries = useMemo(
    () => clockWindowBoundaries({ switchedOn, opensAt, closesAt }),
    [switchedOn, opensAt, closesAt],
  );
  return useClockSwitch({ isOn, boundaries, ...options });
}
