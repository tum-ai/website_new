"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useState,
} from "react";
import { nearestMark } from "./ribbon";

/** One hackathon the scrubber can stop at, in calendar order. */
type ScrubberEntry = {
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

/** Props for {@link RibbonScrubber}. */
type RibbonScrubberProps = {
  entries: readonly ScrubberEntry[];
  /** The entry shown first (the next hackathon), and without JavaScript. */
  defaultIndex: number;
  /** Accessible name of the slider. */
  label: string;
  /** The wide ribbon (md and up), which the slider lies over. */
  track: ReactNode;
  /** The ribbon for narrow screens, without a slider. */
  compact: ReactNode;
};

const PAGE_STEP = 5;

/**
 * The ribbon's one control: a slider over the whole track that steps
 * through the hackathons in date order (arrow keys, Home and End, Page Up
 * and Down) and follows the pointer to the nearest mark. A hairline marks
 * the chosen hackathon and the readout under the ribbon names it, so
 * keyboard and pointer show the same. The marks themselves are decoration,
 * so the slider is one large target instead of dozens of tiny ones.
 */
export function RibbonScrubber({
  entries,
  defaultIndex,
  label,
  track,
  compact,
}: RibbonScrubberProps) {
  const [index, setIndex] = useState(defaultIndex);
  const current = entries[index];
  if (!current) return null;
  const last = entries.length - 1;
  const clamp = (value: number) => Math.min(last, Math.max(0, value));

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
    setIndex(clamp(target));
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    if (box.width === 0) return;
    const nearest = nearestMark(
      entries,
      (event.clientX - box.left) / box.width,
    );
    if (nearest !== -1 && nearest !== index) setIndex(nearest);
  };

  return (
    <div>
      <div className="relative max-md:hidden">
        {track}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 transition-transform duration-300 ease-brand motion-reduce:transition-none"
          style={{
            transform: `translateX(${(current.x + current.w / 2) * 100}%)`,
          }}
        >
          <span className="absolute -inset-y-2 left-0 border-highlight border-l" />
        </div>
        <div
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={last}
          aria-valuenow={index}
          aria-valuetext={`${current.title}, ${current.dates}`}
          onKeyDown={onKeyDown}
          onPointerMove={onPointerMove}
          className="absolute inset-x-0 -inset-y-3 cursor-crosshair rounded-lg"
        />
      </div>
      <div className="md:hidden">{compact}</div>
      <p className="mt-8 grid gap-1 md:mt-10">
        <span className="font-semibold text-highlight text-label-sm">
          {current.label}
        </span>
        <span className="text-fg text-heading-sm">{current.title}</span>
        <span className="text-fg-muted text-small">{current.dates}</span>
      </p>
    </div>
  );
}
