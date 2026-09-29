import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const rulerStyles = cva("relative", {
  variants: {
    /** Tick heights: `md` under a register, `lg` when the ruler carries a band. */
    size: { md: "h-5", lg: "h-8 md:h-10" },
  },
  defaultVariants: { size: "md" },
});

const tickStyles = cva("absolute bottom-0 w-px -translate-x-1/2", {
  variants: {
    /** Every seventh day from the start is a week tick, drawn taller. */
    week: { true: "h-full", false: "h-1/2" },
    elapsed: { true: "bg-highlight", false: "bg-hairline-strong" },
  },
});

/** Props for {@link DayRuler}. */
export type DayRulerProps = Omit<ComponentProps<"div">, "children"> &
  VariantProps<typeof rulerStyles> & {
    /** Days the ruler spans: it draws `days + 1` ticks, one per midnight. */
    days: number;
    /** Whole days gone, `0..days`: the fill runs to this tick and the mark sits on it. */
    elapsed: number;
    /** Label under the first tick (e.g. "Opened 28 Sep"). */
    startLabel?: ReactNode;
    /** Label under the last tick (e.g. "Deadline 27 Oct"). */
    endLabel?: ReactNode;
    /** Draw the fill once on load, for a ruler above the fold. */
    drawIn?: boolean;
  };

/**
 * A window of days as a ruler: one tick per day, taller ticks every week,
 * and a fill from the first tick to today's with a mark on it, so how much
 * of the window is gone reads at a glance. Built from whole days, not
 * eyeballed. Decorative (`aria-hidden`): state the same fact in text beside
 * it, such as "27 days left".
 */
export function DayRuler({
  days,
  elapsed,
  startLabel,
  endLabel,
  size,
  drawIn = false,
  className,
  ...props
}: DayRulerProps) {
  const span = Math.max(days, 1);
  const done = Math.min(Math.max(elapsed, 0), span);
  const at = (day: number) => `${(day / span) * 100}%`;
  const ticks = Array.from({ length: span + 1 }, (_, day) => day);
  return (
    <div aria-hidden="true" className={className} {...props}>
      <div className={rulerStyles({ size })}>
        {ticks.map((day) => (
          <span
            key={day}
            className={tickStyles({
              week: day % 7 === 0 || day === span,
              elapsed: day <= done,
            })}
            style={{ left: at(day) }}
          />
        ))}
        <span className="absolute inset-x-0 bottom-0 h-px bg-hairline-strong" />
        <span
          data-fill=""
          className={cn(
            "absolute bottom-0 left-0 h-0.5 origin-left bg-highlight",
            drawIn && "motion-safe:animate-draw",
          )}
          style={{ width: at(done) }}
        />
        <span
          data-today=""
          className={cn(
            "absolute bottom-0 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-highlight ring-4 ring-canvas",
            drawIn && "[animation-delay:900ms] motion-safe:animate-fade",
          )}
          style={{ left: at(done) }}
        />
      </div>
      {startLabel || endLabel ? (
        <div className="mt-3 flex justify-between gap-6 text-fg-subtle text-meta">
          <span>{startLabel}</span>
          <span className="text-right">{endLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
