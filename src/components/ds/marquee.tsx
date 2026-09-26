import { cva } from "class-variance-authority";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { keyedChildren } from "./internal";

const trackStyles = cva(
  "flex w-max group-focus-within/marquee:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused]",
  {
    variants: {
      /** Run right to left (default) or left to right. */
      reverse: {
        false: "motion-safe:animate-marquee",
        true: "motion-safe:animate-marquee-reverse",
      },
    },
    defaultVariants: { reverse: false },
  },
);

/** Props for {@link Marquee}. */
export type MarqueeProps = {
  /** One element per item. Keyed elements keep their key. */
  children: ReactNode;
  /** Accessible name for the list, e.g. "Partners". */
  label: string;
  /** Seconds per full loop. Scale with item count for a steady speed. */
  duration?: number;
  /** Run left to right instead. */
  reverse?: boolean;
  /** Gap between items in rem. Default 1.25. */
  gap?: number;
  /** Classes merged over the clipping root. */
  className?: string;
  /** Classes for every item's `li`. */
  itemClassName?: string;
};

/**
 * Infinite horizontal rail. The second copy is `inert` and hidden from
 * assistive tech; hover and keyboard focus pause it. Under reduced motion it
 * stops, drops the copy and scrolls by hand instead, so nothing is
 * unreachable.
 */
export function Marquee({
  children,
  label,
  duration = 48,
  reverse = false,
  gap = 1.25,
  className,
  itemClassName,
}: MarqueeProps) {
  const items = keyedChildren(children);
  const listStyle = { gap: `${gap}rem`, paddingRight: `${gap}rem` };

  const renderList = (copy: boolean) => (
    <ul
      aria-label={copy ? undefined : label}
      aria-hidden={copy ? "true" : undefined}
      inert={copy || undefined}
      data-marquee-copy={copy ? "" : undefined}
      className={cn(
        "flex shrink-0 items-center",
        copy ? "motion-reduce:hidden" : "motion-reduce:pr-0",
      )}
      style={listStyle}
    >
      {items.map(({ key, node }) => (
        <li key={key} className={cn("shrink-0", itemClassName)}>
          {node}
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={cn(
        "group/marquee mask-fade-x relative overflow-hidden motion-reduce:overflow-x-auto motion-reduce:overscroll-x-contain motion-reduce:[mask-image:none]",
        className,
      )}
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      <div className={trackStyles({ reverse })}>
        {renderList(false)}
        {renderList(true)}
      </div>
    </div>
  );
}
