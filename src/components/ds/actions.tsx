import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A row of buttons and status badges. On one line every item keeps its
 * natural width. Once the row wraps (phones), it spans the available width
 * and every item grows to fill its line, so stacked actions share one width.
 * Use it for every group of two or more actions.
 */
export function Actions({
  align = "start",
  className,
  children,
}: {
  align?: "start" | "center";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex w-fit max-w-full flex-wrap items-center gap-3 *:grow",
        align === "center" && "mx-auto justify-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
