"use client";

import { type ComponentProps, useEffect, useRef, useState } from "react";

/** Delay between neighbouring tiles of one batch (a column or a row step). */
export const PASTE_STAGGER_MS = 60;

type PasteState = "idle" | "pending";

/**
 * The poster wall's grid, its tiles pasted up as they scroll in: each row
 * goes up when it enters, sweeping left to right, and the rows on screen at
 * once run as one diagonal wave from the top left (choreography in
 * events.css, `data-paste`).
 *
 * Progressive enhancement like the kit's `Reveal`: the server renders every
 * tile (`idle`); only a grid that starts below the viewport, with motion
 * allowed, is held back after hydration (`pending`). Its tiles are marked
 * `data-pasted` with a `--paste-delay` as they enter. Tiles skipped past
 * above the viewport (a jump or an anchor link) are marked at once, so
 * nothing stays hidden. `Reveal` can't batch by row or stage a layered tile,
 * hence the observer of its own.
 */
export function PosterGrid({ children, ...props }: ComponentProps<"ul">) {
  const ref = useRef<HTMLUListElement>(null);
  const [state, setState] = useState<PasteState>("idle");

  useEffect(() => {
    const grid = ref.current;
    if (!grid) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (grid.getBoundingClientRect().top < window.innerHeight * 0.94) return;

    setState("pending");
    const waiting = new Set(grid.children as Iterable<HTMLElement>);
    const done = (tile: HTMLElement) => {
      waiting.delete(tile);
      observer.unobserve(tile);
      if (waiting.size === 0) stop();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries
          .filter((entry) => entry.isIntersecting)
          .map((entry) => entry.target as HTMLElement);
        stagger(entering);
        for (const tile of entering) done(tile);
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    // A jump from below the wall to above it crosses no threshold, so the
    // observer never reports those tiles: show them at once instead.
    const onScroll = () => {
      if (grid.getBoundingClientRect().top >= 0) return;
      for (const tile of waiting) {
        if (tile.getBoundingClientRect().bottom > 0) continue;
        paste(tile, 0);
        done(tile);
      }
    };
    const stop = () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
    for (const tile of waiting) observer.observe(tile);
    window.addEventListener("scroll", onScroll, { passive: true });
    return stop;
  }, []);

  return (
    <ul ref={ref} data-paste={state} {...props}>
      {children}
    </ul>
  );
}

/** Delays one batch of entering tiles by their column plus their row in it. */
function stagger(tiles: HTMLElement[]) {
  const rows = [...new Set(tiles.map((tile) => tile.offsetTop))].sort(
    (a, b) => a - b,
  );
  for (const tile of tiles) {
    const column = Math.round(tile.offsetLeft / (tile.offsetWidth || 1));
    paste(tile, (column + rows.indexOf(tile.offsetTop)) * PASTE_STAGGER_MS);
  }
}

function paste(tile: HTMLElement, delayMs: number) {
  tile.style.setProperty("--paste-delay", `${delayMs}ms`);
  tile.dataset.pasted = "";
}
