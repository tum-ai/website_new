import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { counter, textKey } from "./internal";
import { Reveal } from "./reveal";
import type { HeadingLevel } from "./types";

/** One step of a {@link Steps} list. */
export type StepItem = {
  /** The step's name; a string title doubles as its list key. */
  title: ReactNode;
  /** One or two sentences. */
  description?: ReactNode;
  /** Icon in the marker instead of the number (the number moves above the title). */
  icon?: LucideIcon;
  /** Overrides the automatic "01" numbering (e.g. "02A"). */
  number?: string;
  /** Stable key when the title is markup. */
  id?: string;
};

const listStyles = cva("relative grid gap-10 md:gap-8", {
  variants: {
    /** Columns on wide screens. */
    columns: {
      3: "md:grid-cols-3",
      4: "md:grid-cols-2 lg:grid-cols-4",
      5: "md:grid-cols-3 lg:grid-cols-5",
    },
  },
  defaultVariants: { columns: 4 },
});

const railStyles = cva("absolute right-0 left-0 hidden md:block", {
  variants: {
    /**
     * The line that joins the markers on wide screens: `solid` hairline,
     * `dashed` violet dashes (a path that runs on), or `none`.
     */
    rail: {
      solid: "h-px bg-hairline",
      dashed:
        "h-0.5 bg-[linear-gradient(to_right,var(--color-violet-500)_0_50%,transparent_50%_100%)] bg-size-[10px_2px] opacity-60",
      none: "",
    },
    marker: {
      badge: "top-6",
      dot: "top-[0.3125rem]",
    },
  },
  defaultVariants: { rail: "solid", marker: "badge" },
});

const markerStyles = cva("relative grid place-items-center rounded-full", {
  variants: {
    /**
     * `badge`: a 48px circle with the number or icon. `dot`: a small violet
     * dot on the rail, with the number above the title.
     */
    marker: {
      badge:
        "tabular size-12 border border-hairline-strong bg-canvas font-semibold text-fg text-small",
      dot: "size-3 bg-violet-500 shadow-halo",
    },
  },
  defaultVariants: { marker: "badge" },
});

/** Props for {@link Steps}. */
export type StepsProps = VariantProps<typeof listStyles> &
  VariantProps<typeof railStyles> & {
    /** The steps, in order. */
    items: StepItem[];
    /**
     * `columns` (default): markers on a rail, one column per step on wide
     * screens. `rows`: one hairline row per step with the number beside
     * it, for steps that are sentences rather than short labels. `rows`
     * ignores `columns`, `rail`, `marker` and icons.
     */
    layout?: "columns" | "rows";
    /** Heading level of each step title. Default `h3`. */
    headingAs?: HeadingLevel;
    /** Classes merged over the wrapper. */
    className?: string;
  };

/**
 * Numbered process as an ordered list. A rail joins the step markers on wide
 * screens (or, as `rows`, hairlines separate them); steps reveal in sequence.
 */
export function Steps({
  items,
  layout = "columns",
  columns,
  rail,
  marker = "badge",
  headingAs: HeadingTag = "h3",
  className,
}: StepsProps) {
  if (layout === "rows") {
    return (
      <ol className={cn("border-hairline-strong border-t", className)}>
        {items.map((item, index) => {
          const number = item.number ?? counter(index + 1);
          return (
            <Reveal
              as="li"
              key={item.id ?? textKey(item.title, number)}
              delay={index * 70}
              className="grid grid-cols-[3rem_minmax(0,1fr)] items-baseline gap-x-4 border-hairline border-b py-6 md:grid-cols-[6rem_minmax(0,1fr)] md:gap-x-8 md:py-8"
            >
              <span className="tabular text-heading-md text-highlight">
                {number}
              </span>
              <div>
                <HeadingTag className="max-w-3xl text-fg text-heading-md">
                  {item.title}
                </HeadingTag>
                {item.description ? (
                  <div className="mt-2 max-w-2xl text-fg-muted text-small">
                    {item.description}
                  </div>
                ) : null}
              </div>
            </Reveal>
          );
        })}
      </ol>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {rail === "none" ? null : (
        <div aria-hidden="true" className={railStyles({ rail, marker })} />
      )}
      <ol className={listStyles({ columns })}>
        {items.map((item, index) => {
          const Icon = item.icon;
          const number = item.number ?? counter(index + 1);
          const numberAbove = marker === "dot" || Boolean(Icon);
          return (
            <Reveal
              as="li"
              key={item.id ?? textKey(item.title, number)}
              delay={index * 90}
              className="relative"
            >
              <span className={markerStyles({ marker })}>
                {marker === "badge" ? (
                  Icon ? (
                    <Icon
                      aria-hidden="true"
                      className="size-5 text-highlight"
                      strokeWidth={1.75}
                    />
                  ) : (
                    number
                  )
                ) : null}
              </span>
              {numberAbove ? (
                <p className="tabular mt-6 text-eyebrow text-fg-subtle">
                  {number}
                </p>
              ) : null}
              <HeadingTag
                className={cn(
                  "text-fg text-heading-md",
                  numberAbove ? "mt-2" : "mt-6",
                )}
              >
                {item.title}
              </HeadingTag>
              {item.description ? (
                <div className="mt-3 text-fg-muted text-small">
                  {item.description}
                </div>
              ) : null}
            </Reveal>
          );
        })}
      </ol>
    </div>
  );
}
