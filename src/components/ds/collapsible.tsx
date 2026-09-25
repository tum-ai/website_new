"use client";

import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { cn } from "@/lib/cn";

/** Disclosure on Base UI with a smooth height transition. */
export const Collapsible = BaseCollapsible.Root;

export function CollapsibleTrigger({
  className,
  ...props
}: BaseCollapsible.Trigger.Props & { className?: string }) {
  return (
    <BaseCollapsible.Trigger
      className={cn("group/collapsible", className)}
      {...props}
    />
  );
}

export function CollapsiblePanel({
  className,
  ...props
}: BaseCollapsible.Panel.Props & { className?: string }) {
  return (
    <BaseCollapsible.Panel
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-500 ease-brand data-[ending-style]:h-0 data-[starting-style]:h-0 motion-reduce:transition-none",
        className,
      )}
      {...props}
    />
  );
}
