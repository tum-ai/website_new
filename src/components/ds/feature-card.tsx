import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { IconBadge } from "./icon-badge";
import { SpotlightCard } from "./spotlight-card";
import type { HeadingLevel } from "./types";

/** Props for {@link FeatureCard}. */
export type FeatureCardProps = {
  /** Icon in a violet badge that tilts on hover. */
  icon?: LucideIcon;
  /** The card title. */
  title: ReactNode;
  /** A sentence or two of copy. */
  children?: ReactNode;
  /** Editorial counter shown top-right, e.g. "01". */
  index?: string;
  /** Heading level of the title. Default `h3`. */
  headingAs?: HeadingLevel;
  /** Card surface. Default `raised`. */
  variant?: "raised" | "glass" | "outline";
  /** Classes merged over the card. */
  className?: string;
};

/**
 * Icon + title + copy, on a spotlight surface. Icons always use the brand
 * violet; never assign per-card accent colors.
 */
export function FeatureCard({
  icon,
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
        {icon ? <IconBadge icon={icon} interactive /> : null}
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
