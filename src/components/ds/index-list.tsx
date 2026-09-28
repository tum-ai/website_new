"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/cn";
import { Anchor } from "./anchor";
import type { HeadingLevel } from "./types";

/** One destination in an {@link IndexList}. */
export type IndexListItem = {
  /** Stable key. */
  id: string;
  /** Destination name, set large. */
  title: string;
  /** One sentence on what is there, ideally with one concrete fact. */
  description: ReactNode;
  /** Short aside at the end of the row on wide screens (e.g. a status or figure). */
  detail?: ReactNode;
  /** Route or URL. */
  href: string;
  /**
   * Photo for the destination: the sticky preview beside the list from `lg`,
   * an inline thumbnail below it. Decorative, since the title names the row.
   */
  image?: { src: string; position?: string };
};

/** Props for {@link IndexList}. */
export type IndexListProps = {
  /** The destinations, in reading order. */
  items: IndexListItem[];
  /** Heading level of each title. Default `h3`. */
  headingAs?: HeadingLevel;
  /** Classes merged over the wrapper. */
  className?: string;
};

/**
 * A typographic index of destinations: full-width link rows with a large
 * light title, one line of description and an arrow, separated by hairlines.
 * On wide screens a sticky photo beside the list shows the row that is
 * hovered or focused (the first one until then), and while the pointer or
 * keyboard focus is in the list the other rows dim.
 * Keyboard focus drives the preview exactly like the pointer.
 */
export function IndexList({
  items,
  headingAs: HeadingTag = "h3",
  className,
}: IndexListProps) {
  const [active, setActive] = useState(items[0]?.id);
  const withMedia = items.some((item) => item.image);

  return (
    <div
      className={cn(
        "grid gap-12",
        withMedia && "lg:grid-cols-12 lg:gap-16",
        className,
      )}
    >
      <ul
        className={cn(
          "group/index border-hairline-strong border-t",
          withMedia && "lg:col-span-7",
        )}
      >
        {items.map((item) => (
          <li
            key={item.id}
            data-active={item.id === active}
            className="border-hairline border-b transition-opacity duration-500 ease-brand group-has-[a:focus-visible]/index:not-data-[active=true]:opacity-45 motion-reduce:transition-none [@media(hover:hover)]:group-hover/index:not-data-[active=true]:opacity-45"
          >
            <Anchor
              href={item.href}
              onPointerEnter={() => setActive(item.id)}
              onFocus={() => setActive(item.id)}
              className="group/row grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 py-7 md:py-9"
            >
              <div className="min-w-0">
                <HeadingTag className="text-display-md text-fg transition-transform duration-500 ease-brand group-hover/row:translate-x-2 motion-reduce:transition-none">
                  {item.title}
                </HeadingTag>
                <p className="mt-3 max-w-xl text-fg-muted text-small md:text-body">
                  {item.description}
                </p>
              </div>
              <div className="flex items-center gap-6 self-start pt-2 md:self-center md:pt-0">
                {item.detail ? (
                  <div className="hidden text-right text-fg-muted text-meta md:block">
                    {item.detail}
                  </div>
                ) : null}
                {item.image ? (
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl bg-sunken sm:size-20 lg:hidden">
                    <Image
                      src={item.image.src}
                      alt=""
                      fill
                      sizes="5rem"
                      className="object-cover"
                      style={{ objectPosition: item.image.position }}
                    />
                  </div>
                ) : null}
                <span
                  aria-hidden="true"
                  className="hidden size-12 shrink-0 place-items-center rounded-full border border-hairline-strong text-fg transition-colors duration-300 group-hover/row:border-fg group-hover/row:bg-fg group-hover/row:text-canvas sm:grid"
                >
                  <ArrowRight className="size-4 transition-transform duration-500 ease-brand group-hover/row:-rotate-45 motion-reduce:transition-none" />
                </span>
              </div>
            </Anchor>
          </li>
        ))}
      </ul>

      {withMedia ? (
        <div aria-hidden="true" className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-[var(--header-offset)] aspect-[4/5] overflow-hidden rounded-4xl bg-sunken">
            {items.map((item) =>
              item.image ? (
                <Image
                  key={item.id}
                  src={item.image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 30rem, 38vw"
                  data-active={item.id === active}
                  className="scale-[1.03] object-cover opacity-0 transition-[opacity,scale] duration-700 ease-brand data-[active=true]:scale-100 data-[active=true]:opacity-100 motion-reduce:transition-none"
                  style={{ objectPosition: item.image.position }}
                />
              ) : null,
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
