import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Outlined violet pill from the brand guide ("Mission", "Vision"). */
export function Pill({
  className,
  size = "md",
  ...props
}: ComponentPropsWithoutRef<"span"> & { size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border-[1.5px] border-violet-500 font-medium text-fg",
        size === "sm" && "px-3 py-1 text-meta",
        size === "md" && "px-4 py-1.5 text-small",
        size === "lg" && "px-6 py-2 text-heading-md",
        className,
      )}
      {...props}
    />
  );
}

/** Small filled chip for keywords, categories and counts. */
export function Tag({ className, ...props }: ComponentPropsWithoutRef<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-fg/[0.07] px-3 py-1 text-meta font-medium text-fg-muted",
        className,
      )}
      {...props}
    />
  );
}

/* Minimum heights match Button heights. The radius is half the one-line
 * height, so a label too long for a narrow phone wraps into a rounded
 * rectangle instead of overflowing its row. */
const statusSizes = {
  sm: "min-h-9 rounded-[1.125rem] py-1.5 pr-4 pl-3 text-[0.8125rem]",
  md: "min-h-11 rounded-[1.375rem] py-2 pr-5 pl-4 text-[0.9375rem]",
  lg: "min-h-13 rounded-[1.625rem] py-2.5 pr-6 pl-5 text-base",
} as const;

/**
 * Status line with a dot: `live` pulses (e.g. applications open), `idle` is
 * static and muted (e.g. closed).
 */
export function StatusBadge({
  status = "live",
  size = "md",
  children,
  className,
}: {
  status?: "live" | "idle";
  /**
   * Matches Button heights (sm/md/lg; default md like Button) so badges sit
   * flush beside buttons. Always use the size of the neighbouring button.
   */
  size?: keyof typeof statusSizes;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center border border-hairline-strong bg-fg/[0.04] text-center leading-snug font-semibold text-balance text-fg backdrop-blur",
        statusSizes[size],
        className,
      )}
    >
      {/* One text run with an inline dot: a wrapped label stays centred and
          the dot travels with its first line. */}
      <span>
        <span
          aria-hidden
          className="relative mr-2.5 inline-flex size-2 align-middle"
        >
          {status === "live" ? (
            <span className="absolute inset-0 rounded-full bg-violet-400 motion-safe:animate-pulse-ring" />
          ) : null}
          <span
            className={cn(
              "relative size-2 rounded-full",
              status === "live" ? "bg-violet-400" : "bg-fg-subtle",
            )}
          />
        </span>
        {children}
      </span>
    </span>
  );
}
