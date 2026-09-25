import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * The brand guide's slide header: three short labels spread across a hairline
 * row (e.g. "TUM.ai · E-Lab 6.0 · Munich 2026"). The middle item hides on
 * small screens.
 */
export function MetaRow({
  items,
  className,
}: {
  items: [ReactNode, ReactNode?, ReactNode?];
  className?: string;
}) {
  const [first, second, third] = items;
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 border-b border-hairline pb-4 text-meta font-medium text-fg-subtle",
        className,
      )}
    >
      <span>{first}</span>
      {second !== undefined ? (
        <span className="hidden md:block">{second}</span>
      ) : null}
      {third !== undefined ? <span className="text-right">{third}</span> : null}
    </div>
  );
}
