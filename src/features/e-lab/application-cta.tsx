import { ArrowUpRight } from "lucide-react";
import { useId } from "react";

import { buttonStyles, StatusBadge } from "@/components/ds";
import { eLabApplicationCopy, eLabConfig, eLabPhaseCopy } from "@/config/e-lab";
import { cn } from "@/lib/utils";
import { ELabPhase } from "./e-lab-phase";

type ELabApplicationCtaProps = {
  /** Which label set to show: the hero's (with the cohort) or the card's. */
  label: "hero" | "card";
  /** Extra classes for both states, merged over the design-system defaults. */
  className?: string;
  /** Extra classes while applications are open. */
  openClassName?: string;
  /** Extra classes while applications are closed. */
  closedClassName?: string;
  size?: "md" | "lg";
};

/* Pill radius = half the one-line height, so a label that has to wrap on a
 * narrow phone becomes a rounded rectangle instead of overflowing. */
const closedSizes = {
  md: "min-h-11 rounded-[1.375rem] px-5 py-2 text-[0.9375rem]",
  lg: "min-h-13 rounded-[1.625rem] px-6 py-2.5 text-base",
} as const;

const labelKey = { hero: "heroCtaLabel", card: "cardCtaLabel" } as const;

/**
 * The application call to action for the current E-Lab cohort. It follows
 * the application phase (see <ELabPhase>), so it switches by itself at the
 * deadline:
 *
 * - open: an external link to the application form in a new tab (announced to
 *   screen readers via `aria-describedby`, because `aria-label` replaces the
 *   visible text), styled as the primary button with a nudging arrow.
 * - closed: a non-interactive status (`role="status"`, `aria-disabled`) styled
 *   as an idle status pill, so the page never shows a dead button.
 */
export function ELabApplicationCta({
  label,
  className,
  openClassName,
  closedClassName,
  size = "lg",
}: ELabApplicationCtaProps) {
  const hintId = useId();
  const { open, closed } = eLabPhaseCopy;

  return (
    <ELabPhase
      open={
        <a
          href={eLabConfig.applicationUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={open.ariaLabel}
          aria-describedby={hintId}
          className={cn(
            buttonStyles({ variant: "primary", size }),
            className,
            openClassName,
          )}
        >
          {open[labelKey[label]]}
          <span id={hintId} className="sr-only">
            (opens in a new tab)
          </span>
          <ArrowUpRight
            aria-hidden
            className="size-4 transition-transform duration-500 ease-brand group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5 motion-reduce:transition-none"
          />
        </a>
      }
      closed={
        <span
          role="status"
          aria-disabled="true"
          aria-label={closed.ariaLabel}
          className={cn(
            "inline-flex max-w-full items-center justify-center border border-hairline-strong bg-fg/[0.04] text-center leading-snug font-semibold text-balance text-fg-muted select-none",
            closedSizes[size],
            className,
            closedClassName,
          )}
        >
          {/* Inline dot, as in StatusBadge: a wrapped label stays centred. */}
          <span>
            <span
              aria-hidden
              className="mr-2.5 inline-block size-2 rounded-full bg-fg-subtle align-middle"
            />
            {closed[labelKey[label]]}
          </span>
        </span>
      }
    />
  );
}

/**
 * Live "applications open" badge with the deadline from the E-Lab config.
 * Renders nothing once applications close: the closed CTA already reads as a
 * status there.
 */
export function ELabApplicationStatus({
  className,
  size = "lg",
}: {
  className?: string;
  /** Keep equal to the neighbouring CTA's size so both share one height. */
  size?: "sm" | "md" | "lg";
}) {
  return (
    <ELabPhase
      open={
        <StatusBadge status="live" size={size} className={className}>
          <span>
            {/* Shorter label on phones keeps the pill on one line; below about
                360px it wraps (see StatusBadge). */}
            <span className="max-sm:hidden">Applications open</span>
            <span className="sm:hidden">Open</span> until{" "}
            <span className="tabular">{eLabApplicationCopy.deadline}</span>
          </span>
        </StatusBadge>
      }
      closed={null}
    />
  );
}
