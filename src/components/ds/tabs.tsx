"use client";

import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "@/lib/cn";

/** Tabs on Base UI: arrow-key navigation and ARIA wiring come from there. */
export function Tabs({
  className,
  ...props
}: BaseTabs.Root.Props & { className?: string }) {
  return <BaseTabs.Root className={className} {...props} />;
}

/**
 * Segmented control. The active pill glides between tabs using Base UI's
 * `--active-tab-*` variables.
 */
export function TabsList({
  className,
  children,
  ...props
}: BaseTabs.List.Props & { className?: string }) {
  return (
    <BaseTabs.List
      className={cn(
        "relative isolate inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-fg/[0.07] p-1 [scrollbar-width:none]",
        className,
      )}
      {...props}
    >
      {children}
      <BaseTabs.Indicator className="absolute top-(--active-tab-top) left-0 -z-10 h-(--active-tab-height) w-(--active-tab-width) translate-x-(--active-tab-left) rounded-full bg-fg shadow-soft transition-[translate,width] duration-500 ease-brand motion-reduce:transition-none" />
    </BaseTabs.List>
  );
}

export function TabsTab({
  className,
  ...props
}: BaseTabs.Tab.Props & { className?: string }) {
  return (
    <BaseTabs.Tab
      className={cn(
        "relative h-10 shrink-0 whitespace-nowrap rounded-full px-5 font-semibold text-fg-muted text-small transition-colors duration-300 hover:text-fg focus-visible:outline-offset-2 data-[active]:text-canvas max-sm:h-auto max-sm:min-h-10 max-sm:shrink max-sm:whitespace-normal max-sm:py-2 max-sm:leading-tight",
        className,
      )}
      {...props}
    />
  );
}

export function TabsPanel({
  className,
  ...props
}: BaseTabs.Panel.Props & { className?: string }) {
  return (
    <BaseTabs.Panel
      className={cn(
        "outline-none motion-safe:animate-rise-sm [&[hidden]]:hidden",
        className,
      )}
      {...props}
    />
  );
}
