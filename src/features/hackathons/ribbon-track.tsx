import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { DrawnMark } from "./hackathons-view";
import { RIBBON } from "./ribbon";

/**
 * Lane sizes per use: the hero's ribbon, one year's row of it on a phone,
 * and the closing strip. `--above` is the Makeathons' height above the
 * axis; `--lane-step` the pitch of the lanes below it, `--lane-h` a mark's
 * height in them.
 */
const sizes = {
  hero: {
    "--above": "8rem",
    "--lane-step": "1.875rem",
    "--lane-h": "1.375rem",
  },
  year: {
    "--above": "3rem",
    "--lane-step": "1.125rem",
    "--lane-h": "0.75rem",
  },
  strip: {
    "--above": "5rem",
    "--lane-step": "1.5rem",
    "--lane-h": "1.125rem",
  },
} as const satisfies Record<string, Record<`--${string}`, string>>;

const kindStyles = {
  makeathon: "bg-highlight",
  league: "bg-highlight",
  partner: "bg-fg/40",
} as const;

/** A fraction as a CSS percentage. */
const percent = (fraction: number) => `${fraction * 100}%`;

function Mark({
  mark,
  solidUpcoming,
}: {
  mark: DrawnMark;
  solidUpcoming: boolean;
}) {
  const hollow = mark.upcoming && !solidUpcoming;
  return (
    <span
      data-lane={mark.lane === 0 ? "above" : "below"}
      className={cn(
        "hk-mark absolute rounded-xs",
        mark.lane === 0
          ? "bottom-0 h-full"
          : "top-[calc((var(--lane)-1)*var(--lane-step))] h-(--lane-h)",
        hollow
          ? "outline-1 outline-highlight -outline-offset-1"
          : kindStyles[mark.kind],
      )}
      style={
        {
          "--x": mark.x,
          "--lane": mark.lane,
          left: percent(mark.x),
          width: `max(${percent(mark.w)}, ${RIBBON.minPx}px)`,
        } as CSSProperties
      }
    />
  );
}

/** Props for {@link RibbonTrack}. */
type RibbonTrackProps = {
  marks: readonly DrawnMark[];
  /** Lanes below the axis. */
  lanes: number;
  /** 1 January of each year: a hairline across the track. */
  years?: readonly { year: number; x: number }[];
  size: keyof typeof sizes;
  /**
   * Draw hackathons still to come solid, as the close does with the next
   * one; elsewhere they are hollow.
   */
  solidUpcoming?: boolean;
  /** Plays the load moment (`hackathons.css`); the hero only. */
  animate?: boolean;
  className?: string;
};

/**
 * The ribbon as drawn: Makeathons rise above the axis, every other
 * hackathon hangs below it in its lane, each at its dates on the track
 * (fractions from `ribbon.ts`). Decoration only: the hackathons are listed
 * for screen readers beside it.
 */
export function RibbonTrack({
  marks,
  lanes,
  years = [],
  size,
  solidUpcoming = false,
  animate = false,
  className,
}: RibbonTrackProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative", animate && "hk-animate", className)}
      style={sizes[size] as CSSProperties}
    >
      {years.map(({ year, x }) => (
        <span
          key={year}
          className="absolute inset-y-0 border-hairline border-l"
          style={{ left: percent(x) }}
        />
      ))}
      <div className="relative h-(--above)">
        {marks
          .filter(({ lane }) => lane === 0)
          .map((mark) => (
            <Mark key={mark.id} mark={mark} solidUpcoming={solidUpcoming} />
          ))}
      </div>
      <div className="hk-axis h-px origin-left bg-hairline-strong" />
      <div
        className="relative"
        style={{ height: `calc(${lanes} * var(--lane-step))` }}
      >
        {marks
          .filter(({ lane }) => lane > 0)
          .map((mark) => (
            <Mark key={mark.id} mark={mark} solidUpcoming={solidUpcoming} />
          ))}
      </div>
    </div>
  );
}

/** The year under each 1 January hairline of a {@link RibbonTrack}. */
export function RibbonYears({
  years,
  className,
}: {
  years: readonly { year: number; x: number }[];
  className?: string;
}) {
  return (
    <div aria-hidden="true" className={cn("relative h-5", className)}>
      {years.map(({ year, x }) => (
        <span
          key={year}
          className="tabular absolute top-0 pl-2 text-fg-subtle text-meta"
          style={{ left: percent(x) }}
        >
          {year}
        </span>
      ))}
    </div>
  );
}
