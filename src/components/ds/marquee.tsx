import { Children, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type MarqueeProps = {
  children: ReactNode;
  /** Accessible name for the list. */
  label: string;
  /** Seconds per full loop. Scale with item count for a steady speed. */
  duration?: number;
  reverse?: boolean;
  /** Gap between items in rem. */
  gap?: number;
  className?: string;
  itemClassName?: string;
};

/**
 * Infinite horizontal rail. The second copy is `inert` and hidden from
 * assistive tech; hover and keyboard focus pause it; reduced motion swaps it
 * for a static wrapped list so nothing is unreachable.
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
  const items = Children.toArray(children);
  const listStyle = { gap: `${gap}rem`, paddingRight: `${gap}rem` };

  const renderList = (copy: boolean) => (
    <ul
      aria-label={copy ? undefined : label}
      aria-hidden={copy || undefined}
      inert={copy || undefined}
      className={cn(
        "flex shrink-0 items-center",
        copy && "motion-reduce:hidden",
        !copy && "motion-reduce:pr-0",
      )}
      style={listStyle}
    >
      {items.map((item, index) => (
        <li key={index} className={cn("shrink-0", itemClassName)}>
          {item}
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
      <div
        className={cn(
          "flex w-max group-focus-within/marquee:[animation-play-state:paused] group-hover/marquee:[animation-play-state:paused]",
          reverse
            ? "motion-safe:animate-marquee-reverse"
            : "motion-safe:animate-marquee",
        )}
      >
        {renderList(false)}
        {renderList(true)}
      </div>
    </div>
  );
}
