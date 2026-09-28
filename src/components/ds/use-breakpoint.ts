"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Tailwind's breakpoints (index.css keeps the defaults), for islands that
 * must know the layout in JavaScript. Media queries can't read the theme's
 * `--breakpoint-*` variables, and Tailwind only emits the ones classes use.
 */
const breakpoints = {
  sm: "40rem",
  md: "48rem",
  lg: "64rem",
  xl: "80rem",
  "2xl": "96rem",
} as const;

/** A Tailwind breakpoint name, as in `md:`. */
export type Breakpoint = keyof typeof breakpoints;

/**
 * Whether the viewport is at least as wide as `breakpoint`, the same
 * condition as Tailwind's `md:` prefix; it updates as the window resizes.
 * `false` on the server and during hydration, so render the narrow layout
 * (or nothing) first and let the wide one follow.
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const query = `(width >= ${breakpoints[breakpoint]})`;
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}
