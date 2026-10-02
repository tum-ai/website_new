"use client";

import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { Container } from "@/components/ds";
import { useMediaQuery } from "@/lib/use-media-query";
import { nearestMark } from "./ribbon";

/** One hackathon the replay can stop at, in calendar order. */
type ReplayEntry = {
  id: string;
  title: string;
  /** "26 to 28 April 2024". */
  dates: string;
  /** The small label over the title: its kind, or "Next". */
  label: string;
  /** Its mark on the wide track, as fractions of the track's width. */
  x: number;
  w: number;
};

/** Props for {@link RibbonReplay}. */
type RibbonReplayProps = {
  entries: readonly ReplayEntry[];
  /** The entry shown without the replay (the next hackathon). */
  defaultIndex: number;
  /** Accessible name of the slider. */
  label: string;
  /** The heading block, beside the readout. */
  intro: ReactNode;
  /** The wide ribbon (md and up), which the slider lies over. */
  track: ReactNode;
  /** The ribbon for narrow screens, without a slider. */
  compact: ReactNode;
  /** The key under the ribbon. */
  legend: ReactNode;
};

/**
 * When the hero replays on scroll: wide screens with motion allowed. The
 * same query pins the stage in `hackathons.css`.
 */
const REPLAY_QUERY =
  "(min-width: 48rem) and (prefers-reduced-motion: no-preference)";

const PAGE_STEP = 5;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

/** Moves the playhead over the wide track; marks after `lit` dim. */
function paint(wide: HTMLElement | null, playhead: number, lit: number) {
  wide?.style.setProperty("--playhead", String(playhead));
  wide?.style.setProperty("--lit", String(lit));
}

/**
 * The hero's stage: the heading, a readout that numbers and names one
 * hackathon, and the ribbon. On wide screens with motion allowed the stage
 * pins while its band scrolls by, and the scroll replays the record: a
 * playhead sweeps from the first Makeathon to the next hackathon, the marks
 * light up as it passes (`--lit`, read by `hackathons.css`), and the readout
 * follows it. Arrow keys, Home and End (a slider over the whole ribbon) and
 * the pointer pick a hackathon too. Otherwise the stage is static: every
 * mark lit and the readout on the next hackathon, as the server renders it.
 */
export function RibbonReplay({
  entries,
  defaultIndex,
  label,
  intro,
  track,
  compact,
  legend,
}: RibbonReplayProps) {
  const [index, setIndex] = useState(defaultIndex);
  const bandRef = useRef<HTMLDivElement>(null);
  const wideRef = useRef<HTMLDivElement>(null);
  const replay = useMediaQuery(REPLAY_QUERY);
  const centres = entries.map(({ x, w }) => x + w / 2);
  const centresKey = centres.join(",");

  useEffect(() => {
    const at = centresKey.split(",").map(Number);
    const home = at[defaultIndex] ?? 1;
    const band = bandRef.current;
    if (!replay || !band) {
      paint(wideRef.current, home, 1);
      setIndex(defaultIndex);
      return;
    }
    // Paced by hackathon, not by day: each one gets an equal share of the
    // scroll, so the playhead slows down where the record gets dense.
    const steps = defaultIndex;
    let frame = 0;
    const update = () => {
      frame = 0;
      const box = band.getBoundingClientRect();
      const travel = box.height - window.innerHeight;
      const progress = travel > 0 ? clamp(-box.top / travel, 0, 1) : 1;
      const step = Math.min(Math.floor(progress * steps), steps - 1);
      const playhead =
        steps > 0
          ? at[step] + (at[step + 1] - at[step]) * (progress * steps - step)
          : home;
      paint(wideRef.current, playhead, playhead);
      // The hackathon the playhead is nearest to, in steps.
      setIndex(Math.round(progress * steps));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [replay, centresKey, defaultIndex]);

  const current = entries[index];
  if (!current) return null;
  const last = entries.length - 1;

  const choose = (next: number) => {
    const target = clamp(next, 0, last);
    setIndex(target);
    const centre = centres[target] ?? 0;
    paint(wideRef.current, centre, replay ? centre : 1);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const steps: Record<string, number> = {
      ArrowRight: index + 1,
      ArrowUp: index + 1,
      ArrowLeft: index - 1,
      ArrowDown: index - 1,
      PageUp: index + PAGE_STEP,
      PageDown: index - PAGE_STEP,
      Home: 0,
      End: last,
    };
    const target = steps[event.key];
    if (target === undefined) return;
    event.preventDefault();
    choose(target);
  };

  // Down as well as move: a tap on a touch screen fires no move.
  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width === 0) return;
    const nearest = nearestMark(
      entries,
      (event.clientX - box.left) / box.width,
    );
    if (nearest !== -1 && nearest !== index) choose(nearest);
  };

  const home = centres[defaultIndex] ?? 1;
  return (
    <div ref={bandRef} className="hk-replay">
      <div className="hk-stage flex flex-col pt-[calc(var(--header-height)+clamp(1.5rem,min(6vw,6svh),5rem))] pb-[clamp(1.5rem,min(6vw,5svh),5rem)]">
        <Container className="grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          {/* Keyed: Container passes its children on as one list. */}
          <Fragment key="intro">{intro}</Fragment>
          <p
            key="readout"
            className="grid content-end gap-1 lg:justify-items-end lg:text-right"
          >
            <span className="font-semibold text-highlight text-label-sm">
              {current.label}
            </span>
            <span
              aria-hidden="true"
              className="tabular font-light text-display-2xl text-fg leading-none"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="mt-3 text-fg text-heading-md">
              {current.title}
            </span>
            <span className="text-fg-muted text-small">{current.dates}</span>
          </p>
        </Container>
        <div className="mt-12 px-(--gutter) md:mt-auto md:pt-[clamp(1.5rem,5svh,3.5rem)]">
          <div
            ref={wideRef}
            className="relative max-md:hidden"
            style={{ "--playhead": home, "--lit": 1 } as CSSProperties}
          >
            {track}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 translate-x-[calc(var(--playhead)*100%)]"
            >
              <span className="absolute -inset-y-3 left-0 border-highlight border-l" />
            </div>
            <div
              role="slider"
              tabIndex={0}
              aria-label={label}
              aria-orientation="horizontal"
              aria-valuemin={0}
              aria-valuemax={last}
              aria-valuenow={index}
              aria-valuetext={`${current.label}: ${current.title}, ${current.dates}`}
              onKeyDown={onKeyDown}
              onPointerDown={onPointer}
              onPointerMove={onPointer}
              className="absolute inset-x-0 -inset-y-4 cursor-crosshair rounded-lg"
            />
          </div>
          <div className="md:hidden">{compact}</div>
          <div className="mt-6">{legend}</div>
        </div>
      </div>
    </div>
  );
}
