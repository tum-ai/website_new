"use client";

import { ChevronDown } from "lucide-react";
import { type MouseEvent, useEffect, useState } from "react";
import {
  Collapsible,
  CollapsiblePanel,
  CollapsibleTrigger,
} from "@/components/ds";
import { cn } from "@/lib/cn";

export type LegalTocItem = {
  /** id of the `<section>` the entry points to. */
  id: string;
  number: string;
  title: string;
};

/**
 * Table of contents for long legal documents. From `lg` up it is a sticky
 * list with scroll spy; below `lg` it is a disclosure at the top of the
 * document. Entries are plain fragment links, so they work without
 * JavaScript; with it they scroll smoothly (instantly under reduced motion)
 * and move focus to the section heading.
 */
export function LegalToc({
  items,
  label,
}: {
  items: LegalTocItem[];
  label: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);
    if (sections.length === 0) return;

    // Current section: the last one whose top has passed a reading line 30%
    // down the viewport; the last section once the page bottom is reached;
    // none above the first section.
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 4;
      let current: string | null = null;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) current = section.id;
      }
      if (atBottom && current) current = sections[sections.length - 1].id;
      setActive(current);
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
  }, [items]);

  const jumpTo = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    window.history.pushState(null, "", `#${id}`);
    target
      .querySelector<HTMLElement>("h2[tabindex]")
      ?.focus({ preventScroll: true });
    setActive(id);
  };

  const list = (
    <ol className="space-y-0.5">
      {items.map((item) => {
        const current = item.id === active;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => jumpTo(event, item.id)}
              aria-current={current ? "location" : undefined}
              className={cn(
                "relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-1 rounded-2xl py-2 pr-3 pl-4 text-small transition-colors duration-300 ease-brand hover:bg-fg/[0.05] hover:text-fg",
                current ? "text-fg" : "text-fg-muted",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-y-2.5 left-0 w-0.5 origin-top rounded-full bg-highlight transition-[scale] duration-500 ease-brand motion-reduce:transition-none",
                  current ? "scale-y-100" : "scale-y-0",
                )}
              />
              <span
                className={cn(
                  "tabular transition-colors duration-300",
                  current ? "text-highlight" : "text-fg-subtle",
                )}
              >
                {item.number}
              </span>
              <span className={cn(current && "font-semibold")}>
                {item.title}
              </span>
            </a>
          </li>
        );
      })}
    </ol>
  );

  return (
    <>
      <nav aria-label={label} className="lg:hidden">
        <Collapsible className="rounded-3xl bg-sunken">
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 rounded-3xl px-6 py-4 text-left text-heading-sm text-fg">
            <span>{label}</span>
            <ChevronDown
              aria-hidden
              className="size-5 shrink-0 text-fg-muted transition-transform duration-500 ease-brand group-data-[panel-open]/collapsible:rotate-180 motion-reduce:transition-none"
            />
          </CollapsibleTrigger>
          <CollapsiblePanel>
            <div className="px-2 pb-2">{list}</div>
          </CollapsiblePanel>
        </Collapsible>
      </nav>
      <nav
        aria-label={label}
        className="hidden lg:sticky lg:top-28 lg:-ml-4 lg:block lg:max-h-[calc(100dvh-8rem)] lg:self-start lg:overflow-y-auto"
      >
        <p className="mb-4 pl-4 text-eyebrow text-fg-subtle uppercase">
          {label}
        </p>
        {list}
      </nav>
    </>
  );
}
