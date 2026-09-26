import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SpotlightCard } from "./spotlight-card";

type FeatureCardProps = {
  icon?: LucideIcon;
  title: ReactNode;
  children?: ReactNode;
  /** Editorial counter shown top-right, e.g. "01". */
  index?: string;
  headingAs?: "h2" | "h3" | "h4";
  variant?: "raised" | "glass" | "outline";
  className?: string;
};

/**
 * Icon + title + copy, on a spotlight surface. Icons always use the brand
 * violet; never assign per-card accent colors.
 */
export function FeatureCard({
  icon: Icon,
  title,
  children,
  index,
  headingAs: HeadingTag = "h3",
  variant = "raised",
  className,
}: FeatureCardProps) {
  return (
    <SpotlightCard
      variant={variant}
      padding="lg"
      className={cn("flex h-full flex-col", className)}
    >
      <div className="flex items-start justify-between gap-4">
        {Icon ? (
          <span className="grid size-12 place-items-center rounded-2xl bg-violet-500/12 text-highlight ring-1 ring-violet-500/20 ring-inset transition-[background-color,color,rotate] duration-500 ease-brand group-hover/card:-rotate-6 group-hover/card:bg-violet-600 group-hover/card:text-white">
            <Icon aria-hidden className="size-5" strokeWidth={1.75} />
          </span>
        ) : null}
        {index ? (
          <span className="tabular text-fg-subtle text-meta">{index}</span>
        ) : null}
      </div>
      <HeadingTag className="mt-7 text-fg text-heading-md">{title}</HeadingTag>
      {children ? (
        <div className="mt-3 text-fg-muted text-small">{children}</div>
      ) : null}
    </SpotlightCard>
  );
}
