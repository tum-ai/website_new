import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";
import type { DrawnMark } from "./hackathons-view";
import { RIBBON } from "./ribbon";

/**
 * The lane sizes: `--above` is the Makeathons' height above the axis;
 * `--lane-step` the pitch of the lanes below it, `--lane-h` a mark's height
 * in them.
 */
const laneSizes = {
  "--above": "clamp(4rem, 13svh, 13rem)",
  "--lane-step": "clamp(1.25rem, 2.8svh, 2rem)",
  "--lane-h": "clamp(0.875rem, 2svh, 1.5rem)",
} as const satisfies Record<`--${string}`, string>;

const kindStyles = {
  makeathon: "bg-highlight",
  league: "bg-highlight",
  partner: "bg-fg/40",
} as const;

/** A fraction as a CSS percentage. */
const percent = (fraction: number) => `${fraction * 100}%`;

function Mark({ mark }: { mark: DrawnMark }) {
  const hollow = mark.upcoming;
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
  animate = false,
  className,
}: RibbonTrackProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative", animate && "hk-animate", className)}
      style={laneSizes as CSSProperties}
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
            <Mark key={mark.id} mark={mark} />
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
            <Mark key={mark.id} mark={mark} />
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
