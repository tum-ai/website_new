import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { cn } from "@/lib/cn";

/*
 * Tabs on Base UI: arrow-key navigation, roving focus and the ARIA wiring
 * come from the primitive. No "use client": the Base UI parts are client
 * components already.
 *
 *   <Tabs defaultValue="projects">
 *     <TabsList aria-label="Research tabs">
 *       <TabsTab value="projects">Projects</TabsTab>
 *     </TabsList>
 *     <TabsPanel value="projects">…</TabsPanel>
 *   </Tabs>
 */

/** Props for {@link Tabs}: Base UI's root props. */
export type TabsProps = Omit<BaseTabs.Root.Props, "className"> & {
  /** Classes for the root element. */
  className?: string;
};

/** Root of a tab set; control it with `value` or seed it with `defaultValue`. */
export function Tabs({ className, ...props }: TabsProps) {
  return <BaseTabs.Root className={className} {...props} />;
}

/** Props for {@link TabsList}: Base UI's list props. */
export type TabsListProps = Omit<BaseTabs.List.Props, "className"> & {
  /** Classes merged over the segmented control. */
  className?: string;
};

/**
 * Segmented control. The active pill glides between tabs using Base UI's
 * `--active-tab-*` variables (instantly under reduced motion). Name it with
 * `aria-label` when no visible heading does.
 */
export function TabsList({ className, children, ...props }: TabsListProps) {
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

/** Props for {@link TabsTab}: Base UI's tab props. */
export type TabsTabProps = Omit<BaseTabs.Tab.Props, "className"> & {
  /** Classes merged over the tab button. */
  className?: string;
};

/** One tab. On phones a long label wraps instead of scrolling the list. */
export function TabsTab({ className, ...props }: TabsTabProps) {
  return (
    <BaseTabs.Tab
      className={cn(
        "relative h-10 shrink-0 whitespace-nowrap rounded-full px-5 font-semibold text-fg-muted text-small transition-colors duration-300 ease-brand hover:text-fg focus-visible:outline-offset-2 data-[active]:text-canvas max-sm:h-auto max-sm:min-h-10 max-sm:shrink max-sm:whitespace-normal max-sm:py-2 max-sm:leading-tight",
        className,
      )}
      {...props}
    />
  );
}

/** Props for {@link TabsPanel}: Base UI's panel props. */
export type TabsPanelProps = Omit<BaseTabs.Panel.Props, "className"> & {
  /** Classes merged over the panel. */
  className?: string;
};

/**
 * The content of one tab; it rises in when selected (not under reduced
 * motion). It is focusable, so keyboard users get the focus ring on it.
 */
export function TabsPanel({ className, ...props }: TabsPanelProps) {
  return (
    <BaseTabs.Panel
      className={cn(
        "rounded-xl motion-safe:animate-rise-sm [&[hidden]]:hidden",
        className,
      )}
      {...props}
    />
  );
}
