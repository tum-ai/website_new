"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { ScrollProgress } from "./parallax";
import { Reveal } from "./reveal";

export type TimelineItem = {
  /** Short label above the title (date, phase, month). */
  label?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
};

/**
 * Vertical timeline. The rail fills with violet as you scroll and each node
 * lights up when it crosses the middle of the viewport. `alternate` zig-zags
 * items on wide screens.
 */
export function Timeline({
  items,
  alternate = false,
  headingAs: HeadingTag = "h3",
  className,
}: {
  items: TimelineItem[];
  alternate?: boolean;
  headingAs?: "h3" | "h4";
  className?: string;
}) {
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

  const railPosition = alternate ? "left-4 md:left-1/2" : "left-4";

  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className={cn(
          "absolute top-2 bottom-2 w-px -translate-x-1/2 bg-hairline",
          railPosition,
        )}
      />
      <ScrollProgress
        target={listRef}
        className={cn(
          "absolute top-2 bottom-2 w-px -translate-x-1/2 bg-gradient-to-b from-violet-300 via-violet-500 to-violet-600",
          railPosition,
        )}
      />
      <ol ref={listRef} className="relative">
        {items.map((item, index) => {
          const isActive = active.has(index);
          const right = alternate && index % 2 === 1;
          return (
            <li
              key={index}
              data-index={index}
              className={cn(
                "relative pb-14 pl-14 last:pb-0",
                alternate &&
                  "md:grid md:grid-cols-2 md:gap-16 md:pl-0 md:[&>div]:col-start-1",
                right && "md:[&>div]:col-start-2",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-1.5 grid size-8 -translate-x-1/2 place-items-center rounded-full border bg-canvas transition-[border-color,box-shadow] duration-700 ease-brand",
                  railPosition,
                  isActive
                    ? "border-violet-500 shadow-[0_0_0_6px_rgb(154_100_217/0.16)]"
                    : "border-hairline-strong",
                )}
              >
                <span
                  className={cn(
                    "size-2.5 rounded-full transition-[background-color,scale] duration-700 ease-brand",
                    isActive
                      ? "scale-100 bg-violet-500"
                      : "scale-75 bg-fg-subtle",
                  )}
                />
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
                <HeadingTag className="mt-2 text-heading-md text-fg">
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
  );
}
