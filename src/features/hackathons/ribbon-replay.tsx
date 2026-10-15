"use client";

import { Container } from "@tum.ai/ui-kit";
import {
  type CSSProperties,
  Fragment,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
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
  /** The ribbon, which the slider lies over. */
  track: ReactNode;
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

/**
 * Where a picked hackathon sits in a phone's view of the strip, as a share of
 * its width: right of centre, so the run up to it shows.
 */
const VIEW_AT = 0.75;

/**
 * Scrolls the phone strip (`.hk-scroller`) so the track fraction `x` sits at
 * {@link VIEW_AT}; `ifHidden` leaves it alone while `x` is already in view.
 * Wide screens have nothing to scroll.
 */
function reveal(
  scroller: HTMLElement | null,
  x: number,
  { ifHidden = false, smooth = false } = {},
) {
  const track = scroller?.firstElementChild;
  if (!scroller || !(track instanceof HTMLElement)) return;
  if (scroller.scrollWidth <= scroller.clientWidth) return;
  const at = track.offsetLeft + x * track.offsetWidth;
  const view = at - scroller.scrollLeft;
  if (ifHidden && view >= 0 && view <= scroller.clientWidth) return;
  scroller.scrollTo({
    left: at - scroller.clientWidth * VIEW_AT,
    behavior: smooth ? "smooth" : "instant",
  });
}

/** Moves the playhead over the track; marks after `lit` dim. */
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
 *
 * Phones show the same ribbon, wider than the screen, in a strip that
 * scrolls sideways (`hackathons.css`). It opens on the next hackathon, the
 * earlier years a swipe to the left, and a tap on a mark picks it.
 */
export function RibbonReplay({
  entries,
  defaultIndex,
  label,
  intro,
  track,
  legend,
}: RibbonReplayProps) {
  const [index, setIndex] = useState(defaultIndex);
  const bandRef = useRef<HTMLDivElement>(null);
  const wideRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const replay = useMediaQuery(REPLAY_QUERY);
  const centres = entries.map(({ x, w }) => x + w / 2);
  const centresKey = centres.join(",");

  // The phone strip opens on the next hackathon.
  useEffect(() => {
    const home = Number(centresKey.split(",")[defaultIndex] ?? 1);
    reveal(scrollerRef.current, home);
  }, [centresKey, defaultIndex]);

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
    reveal(scrollerRef.current, centre, { ifHidden: true, smooth: true });
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

  const pick = (target: HTMLElement, clientX: number) => {
    const box = target.getBoundingClientRect();
    if (box.width === 0) return;
    const nearest = nearestMark(entries, (clientX - box.left) / box.width);
    if (nearest !== -1 && nearest !== index) choose(nearest);
  };

  // A mouse or pen picks on down as well as move. A finger picks on click
  // only: the strip scrolls under it, and a swipe fires no click.
  const onPointer = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch") pick(event.currentTarget, event.clientX);
  };
  const onClick = (event: MouseEvent<HTMLDivElement>) =>
    pick(event.currentTarget, event.clientX);

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
          <div ref={scrollerRef} className="hk-scroller">
            <div
              ref={wideRef}
              // Clipped across: the playhead is a full-width box moved right,
              // which would otherwise widen the phone strip's scroll.
              className="relative overflow-x-clip [overflow-clip-margin:2px]"
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
                onClick={onClick}
                className="absolute inset-x-0 -inset-y-4 cursor-crosshair rounded-lg"
              />
            </div>
          </div>
          <div className="mt-6">{legend}</div>
        </div>
      </div>
    </div>
  );
}
