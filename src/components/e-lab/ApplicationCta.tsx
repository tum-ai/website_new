import { ArrowUpRight } from "lucide-react";
import { type ReactNode, useId } from "react";

import { buttonStyles, StatusBadge } from "@/components/ds";
import { eLabApplicationCopy, eLabConfig } from "@/config/e-lab";
import { cn } from "@/lib/utils";

type ELabApplicationCtaProps = {
  children: ReactNode;
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

/**
 * The application call to action for the current E-Lab cohort, driven by
 * `eLabConfig.applicationsOpen`:
 *
 * - open: an external link to the application form in a new tab (announced to
 *   screen readers via `aria-describedby`, because `aria-label` replaces the
 *   visible text), styled as the primary button with a nudging arrow.
 * - closed: a non-interactive status (`role="status"`, `aria-disabled`) styled
 *   as an idle status pill, so the page never shows a dead button.
 */
export function ELabApplicationCta({
  children,
  className,
  openClassName,
  closedClassName,
  size = "lg",
}: ELabApplicationCtaProps) {
  const hintId = useId();

  if (eLabConfig.applicationsOpen) {
    return (
      <a
        href={eLabConfig.applicationUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={eLabApplicationCopy.ariaLabel}
        aria-describedby={hintId}
        className={cn(
          buttonStyles({ variant: "primary", size }),
          className,
          openClassName,
        )}
      >
        {children}
        <span id={hintId} className="sr-only">
          (opens in a new tab)
        </span>
        <ArrowUpRight
          aria-hidden
          className="size-4 transition-transform duration-500 ease-brand group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5 motion-reduce:transition-none"
        />
      </a>
    );
  }

  return (
    <span
      role="status"
      aria-disabled="true"
      aria-label={eLabApplicationCopy.ariaLabel}
      className={cn(
        "inline-flex max-w-full items-center gap-2.5 border border-hairline-strong bg-fg/[0.04] leading-snug font-semibold text-fg-muted select-none",
        closedSizes[size],
        className,
        closedClassName,
      )}
    >
      <span aria-hidden className="size-2 shrink-0 rounded-full bg-fg-subtle" />
      {children}
    </span>
  );
}

/**
 * Live "applications open" badge with the deadline from the E-Lab config.
 * Renders nothing while applications are closed: the closed CTA already
 * reads as a status there.
 */
export function ELabApplicationStatus({
  className,
  size = "lg",
}: {
  className?: string;
  /** Keep equal to the neighbouring CTA's size so both share one height. */
  size?: "sm" | "md" | "lg";
}) {
  if (!eLabConfig.applicationsOpen) return null;
  return (
    <StatusBadge status="live" size={size} className={className}>
      <span className="whitespace-nowrap">
        {/* Shorter label on phones keeps the pill on one line. */}
        <span className="max-sm:hidden">Applications open</span>
        <span className="sm:hidden">Open</span> until{" "}
        <span className="tabular">{eLabApplicationCopy.deadline}</span>
      </span>
    </StatusBadge>
  );
}
