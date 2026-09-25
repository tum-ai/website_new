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

/**
 * Status line with a dot: `live` pulses (e.g. applications open), `idle` is
 * static and muted (e.g. closed).
 */
export function StatusBadge({
  status = "live",
  children,
  className,
}: {
  status?: "live" | "idle";
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-hairline-strong bg-fg/[0.04] py-1.5 pr-4 pl-3 text-meta font-semibold text-fg backdrop-blur",
        className,
      )}
    >
      <span aria-hidden className="relative flex size-2">
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
  );
}
