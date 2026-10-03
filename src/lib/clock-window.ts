/**
 * A dated on/off window (an application phase, a campaign) as plain epoch
 * milliseconds. Numbers survive the server-to-client boundary as they are,
 * so a server component resolves the window (from code or the CMS) and hands
 * it to a client island, which keeps it current with `useClockWindow`
 * (`lib/use-clock-switch.ts`) without importing any config.
 */
export type ClockWindow = {
  /** The master switch: while off, the window is closed at every instant. */
  switchedOn: boolean;
  /** Open from this instant on; `null`: open from the start. */
  opensAt: number | null;
  /** Closed from this instant on (exclusive end); `null`: never closes. */
  closesAt: number | null;
};

/**
 * Whether `window` is open at `now`: switched on, at or after `opensAt`, and
 * before `closesAt`. At exactly `closesAt` it is closed.
 */
export function isClockWindowOpen(window: ClockWindow, now: Date): boolean {
  const at = now.getTime();
  return (
    window.switchedOn &&
    (window.opensAt === null || at >= window.opensAt) &&
    (window.closesAt === null || at < window.closesAt)
  );
}

/** Where a {@link ClockWindow} stands: before it opens, open, or closed. */
export type ClockPhase = "upcoming" | "open" | "closed";

/**
 * The phase of `window` at `now`: `open` as {@link isClockWindowOpen};
 * `upcoming` while switched on and before `opensAt`; `closed` otherwise
 * (switched off, or past `closesAt`).
 */
export function clockWindowPhase(window: ClockWindow, now: Date): ClockPhase {
  if (isClockWindowOpen(window, now)) return "open";
  return window.switchedOn &&
    window.opensAt !== null &&
    now.getTime() < window.opensAt
    ? "upcoming"
    : "closed";
}

/** The instants at which {@link isClockWindowOpen} can change. */
export function clockWindowBoundaries(window: ClockWindow): Date[] {
  return [window.opensAt, window.closesAt]
    .filter((at): at is number => at !== null)
    .map((at) => new Date(at));
}
