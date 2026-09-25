import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Actions } from "./actions";
import { Reveal } from "./reveal";
import { Eyebrow } from "./typography";

type SectionHeaderProps = {
  title: ReactNode;
  /** id for the heading, referenced by the section's aria-labelledby. */
  id?: string;
  eyebrow?: ReactNode;
  /** Editorial counter, e.g. 1 → "01". */
  index?: string | number;
  lead?: ReactNode;
  /** Buttons and status badges, laid out by <Actions>. */
  actions?: ReactNode;
  /**
   * `split`: title left, lead bottom-right (partner page rhythm).
   * `stack`: lead under the title. `center`: centered stack.
   */
  layout?: "split" | "stack" | "center";
  size?: "md" | "lg";
  as?: "h2" | "h3";
  className?: string;
};

/** Standard section opening: eyebrow, headline, lead and optional actions. */
export function SectionHeader({
  title,
  id,
  eyebrow,
  index,
  lead,
  actions,
  layout = "split",
  size = "md",
  as: HeadingTag = "h2",
  className,
}: SectionHeaderProps) {
  const heading = (
    <div className={cn(layout === "center" && "mx-auto max-w-3xl")}>
      {eyebrow ? (
        <Reveal>
          <Eyebrow index={index}>{eyebrow}</Eyebrow>
        </Reveal>
      ) : null}
      <Reveal delay={60}>
        <HeadingTag
          id={id}
          className={cn(
            "text-fg",
            eyebrow && "mt-5",
            size === "lg" ? "text-display-lg" : "text-display-md",
          )}
        >
          {title}
        </HeadingTag>
      </Reveal>
    </div>
  );

  const aside =
    lead || actions ? (
      <Reveal
        delay={140}
        className={cn(
          layout === "split" && "lg:max-w-sm lg:pb-1.5",
          layout === "stack" && "mt-6 max-w-2xl",
          layout === "center" && "mx-auto mt-6 max-w-2xl",
        )}
      >
        {lead ? <p className="text-lead text-fg-muted">{lead}</p> : null}
        {actions ? (
          <Actions
            align={layout === "center" ? "center" : "start"}
            className={cn(lead && "mt-6")}
          >
            {actions}
          </Actions>
        ) : null}
      </Reveal>
    ) : null;

  return (
    <header
      className={cn(
        "mb-12 md:mb-16",
        layout === "split" &&
          "flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16",
        layout === "center" && "text-center",
        className,
      )}
    >
      {heading}
      {aside}
    </header>
  );
}
