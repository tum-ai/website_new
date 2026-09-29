"use client";

import {
  type ComponentProps,
  type CSSProperties,
  useEffect,
  useRef,
} from "react";
import { Section } from "@/components/ds";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/**
 * Where the reel should stand for a scroll position through the hero, in
 * rows. The whole track is one full turn (0 to `count`, and `count` is the
 * first name again). Each name holds in the slot for the first and last
 * fifth of its stretch and moves on in between (smoothstep), so the lockup
 * reads as one line most of the time.
 */
export function reelTarget(progress: number, count: number): number {
  const x = clamp(progress, 0, 1) * count;
  const base = Math.floor(x);
  const t = clamp((x - base - 0.2) / 0.6, 0, 1);
  return base + t * t * (3 - 2 * t);
}

/** The share of the remaining distance the reel covers per 60 Hz frame. */
const GLIDE = 0.14;

/**
 * The events hero's band and its reel. The markup comes from the server;
 * this follows the scroll through the band and glides the reel toward
 * {@link reelTarget} (a little inertia, frame-rate independent), writing the
 * position as `--roll` (in rows, within one turn, so the three copies of the
 * reel wrap without a seam) and marking the panel of the name in the slot.
 * It moves only a transform, and stops when the pinned stage is off
 * (reduced motion; see events.css).
 */
export function HeroScroll({
  count,
  style,
  ...props
}: Omit<ComponentProps<typeof Section>, "tone" | "spacing"> & {
  /** How many names the reel holds. */
  count: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const band = ref.current;
    if (!band || count < 2) return;
    const panels = [...band.querySelectorAll<HTMLElement>("[data-host-panel]")];
    const pinned = window.matchMedia("(prefers-reduced-motion: no-preference)");
    let frame = 0;
    let last = 0;
    let current = 0;
    let active = 0;

    const target = () => {
      const range = band.offsetHeight - window.innerHeight;
      const progress =
        range > 0 ? -band.getBoundingClientRect().top / range : 0;
      return reelTarget(progress, count);
    };

    const render = () => {
      const turn = ((current % count) + count) % count;
      band.style.setProperty("--roll", turn.toFixed(4));
      const next = Math.round(turn) % count;
      if (next !== active) {
        panels[active]?.removeAttribute("data-active");
        panels[next]?.setAttribute("data-active", "");
        active = next;
      }
    };

    const tick = (now: number) => {
      frame = 0;
      if (!pinned.matches) return;
      const goal = target();
      const frames = last ? (now - last) / (1000 / 60) : 1;
      last = now;
      current += (goal - current) * (1 - (1 - GLIDE) ** frames);
      if (Math.abs(goal - current) < 0.001) current = goal;
      render();
      if (current !== goal) frame = requestAnimationFrame(tick);
      else last = 0;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    current = target();
    render();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    pinned.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      pinned.removeEventListener("change", schedule);
    };
  }, [count]);

  return (
    <Section
      ref={ref}
      tone="night"
      spacing="none"
      style={{ ...style, "--names": count } as CSSProperties}
      {...props}
    />
  );
}
