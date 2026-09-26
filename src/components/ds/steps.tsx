import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

export type StepItem = {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  /** Overrides the automatic "01" numbering (e.g. "02A"). */
  number?: string;
};

const columnClasses = {
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-3 lg:grid-cols-5",
} as const;

/**
 * Numbered process. A hairline joins the step markers on wide screens; steps
 * reveal in sequence.
 */
export function Steps({
  items,
  columns = 4,
  headingAs: HeadingTag = "h3",
  className,
}: {
  items: StepItem[];
  columns?: keyof typeof columnClasses;
  headingAs?: "h3" | "h4";
  className?: string;
}) {
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="absolute top-6 right-0 left-0 hidden h-px bg-hairline md:block"
      />
      <ol
        className={cn("relative grid gap-10 md:gap-8", columnClasses[columns])}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <Reveal as="li" key={index} delay={index * 90} className="relative">
              <span className="tabular relative grid size-12 place-items-center rounded-full border border-hairline-strong bg-canvas font-semibold text-fg text-small">
                {Icon ? (
                  <Icon
                    aria-hidden
                    className="size-5 text-highlight"
                    strokeWidth={1.75}
                  />
                ) : (
                  (item.number ?? String(index + 1).padStart(2, "0"))
                )}
              </span>
              {Icon ? (
                <p className="tabular mt-6 text-eyebrow text-fg-subtle uppercase">
                  {item.number ?? String(index + 1).padStart(2, "0")}
                </p>
              ) : null}
              <HeadingTag
                className={cn(
                  "text-fg text-heading-md",
                  Icon ? "mt-2" : "mt-6",
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
