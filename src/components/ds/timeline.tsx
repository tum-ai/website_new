"use client";

import { cva } from "class-variance-authority";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { counter, textKey } from "./internal";
import { ScrollProgress } from "./parallax";
import { Reveal } from "./reveal";
import type { HeadingLevel } from "./types";

/** One entry of a {@link Timeline}. */
export type TimelineItem = {
  /** Short label above the title (date, phase, month). */
  label?: ReactNode;
  /** The entry's name; a string title doubles as its list key. */
  title: ReactNode;
  /** One or two sentences, or markup. */
  description?: ReactNode;
  /** Stable key when the title is markup. */
  id?: string;
};

/**
 * `progress`: a hairline that fills with violet as you scroll (default).
 * `dashed`: a static violet dashed path, for plans and open-ended journeys.
 */
export type TimelineRail = "progress" | "dashed";

/**
 * `dot`: a ringed dot that lights up as it crosses the middle of the
 * viewport (default). `number`: the step number ("01") in the ring.
 */
export type TimelineMarker = "dot" | "number";

/** A vertical violet dash pattern (2px wide, 10px period). */
const dashedLine =
  "w-0.5 bg-[linear-gradient(to_bottom,var(--color-violet-500)_0_50%,transparent_50%_100%)] bg-size-[2px_10px]";

const railPositionStyles = cva("absolute -translate-x-1/2", {
  variants: {
    alternate: { true: "left-4 md:left-1/2", false: "left-4" },
  },
});

const markerStyles = cva(
  "absolute top-1.5 grid size-8 -translate-x-1/2 place-items-center rounded-full border bg-canvas transition-[border-color,box-shadow] duration-700 ease-brand motion-reduce:transition-none",
  {
    variants: {
      active: {
        true: "border-violet-500 shadow-halo",
        false: "border-hairline-strong",
      },
      alternate: { true: "left-4 md:left-1/2", false: "left-4" },
    },
  },
);

/** Props for {@link Timeline}. */
export type TimelineProps = {
  /** The entries, in order. */
  items: TimelineItem[];
  /** Zig-zag the entries left and right of a centered rail on wide screens. */
  alternate?: boolean;
  /** Rail style. Default `progress`. */
  rail?: TimelineRail;
  /** Marker style. Default `dot`. */
  marker?: TimelineMarker;
  /**
   * Closing line after the last entry (e.g. "Your journey continues..."),
   * reached by a dashed rail that fades out.
   */
  continuation?: ReactNode;
  /** Heading level of each entry title. Default `h3`. */
  headingAs?: HeadingLevel;
  /** Classes merged over the wrapper. */
  className?: string;
};

/**
 * Vertical timeline as an ordered list. Each marker lights up when it crosses
 * the middle of the viewport; with the `progress` rail the line fills as you
 * scroll (fully filled on the server and under reduced motion).
 */
export function Timeline({
  items,
  alternate = false,
  rail = "progress",
  marker = "dot",
  continuation,
  headingAs: HeadingTag = "h3",
  className,
}: TimelineProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const nodes = Array.from(
      list.querySelectorAll<HTMLElement>("[data-index]"),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        setActive((previous) => {
          const next = new Set(previous);
          for (const entry of entries) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
              next.add(index);
            } else {
              next.delete(index);
            }
          }
          return next;
        });
      },
      { rootMargin: "0px 0px -50% 0px" },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const railPosition = railPositionStyles({ alternate });

  return (
    <div className={className}>
      {/* The rails span the list only, so a continuation below can fade out
          on its own instead of running beside a rail that never ends. */}
      <div data-timeline-track="" className="relative">
        {rail === "dashed" ? (
          <div
            aria-hidden="true"
            className={cn("top-2 bottom-2", dashedLine, railPosition)}
          />
        ) : (
          <>
            <div
              aria-hidden="true"
              className={cn("top-2 bottom-2 w-px bg-hairline", railPosition)}
            />
            <ScrollProgress
              target={listRef}
              className={cn(
                "top-2 bottom-2 w-px bg-gradient-to-b from-violet-300 via-violet-500 to-violet-600",
                railPosition,
              )}
            />
          </>
        )}
        <ol ref={listRef} className="relative">
          {items.map((item, index) => {
            const isActive = active.has(index);
            const right = alternate && index % 2 === 1;
            const number = counter(index + 1);
            return (
              <li
                key={item.id ?? textKey(item.title, number)}
                data-index={index}
                className={cn(
                  "relative pb-14 pl-14 last:pb-0",
                  alternate &&
                    "md:grid md:grid-cols-2 md:gap-16 md:pl-0 md:[&>div]:col-start-1",
                  right && "md:[&>div]:col-start-2",
                )}
              >
                <span
                  aria-hidden="true"
                  className={markerStyles({ active: isActive, alternate })}
                >
                  {marker === "number" ? (
                    <span
                      className={cn(
                        "tabular font-semibold text-meta transition-colors duration-700 ease-brand motion-reduce:transition-none",
                        isActive ? "text-highlight" : "text-fg-subtle",
                      )}
                    >
                      {number}
                    </span>
                  ) : (
                    <span
                      className={cn(
                        "size-2.5 rounded-full transition-[background-color,scale] duration-700 ease-brand motion-reduce:transition-none",
                        isActive
                          ? "scale-100 bg-violet-500"
                          : "scale-75 bg-fg-subtle",
                      )}
                    />
                  )}
                </span>
                <Reveal
                  variant={alternate ? (right ? "right" : "left") : "up"}
                  className={cn(
                    alternate && !right && "md:pr-4 md:text-right",
                    alternate && right && "md:pl-4",
                  )}
                >
                  {item.label ? (
                    <p className="text-eyebrow text-highlight uppercase">
                      {item.label}
                    </p>
                  ) : null}
                  <HeadingTag className="mt-2 text-fg text-heading-md">
                    {item.title}
                  </HeadingTag>
                  {item.description ? (
                    <div className="mt-3 text-body text-fg-muted">
                      {item.description}
                    </div>
                  ) : null}
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
      {continuation ? (
        <Reveal
          variant="fade"
          className={cn(
            "relative pl-14",
            alternate && "md:pl-0 md:text-center",
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "top-2 h-24 [mask-image:linear-gradient(to_bottom,#000_30%,transparent)]",
              dashedLine,
              railPosition,
            )}
          />
          <div className="pt-30 text-fg-muted text-heading-md">
            {continuation}
          </div>
        </Reveal>
      ) : null}
    </div>
  );
}
