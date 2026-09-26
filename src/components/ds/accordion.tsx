import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { HeadingLevel } from "./types";

/*
 * Accordion on Base UI, which handles keyboard, ARIA and focus. Panels stay
 * in the DOM as `hidden="until-found"`, so find-in-page and crawlers still
 * reach the answers. No "use client" here: the Base UI parts are client
 * components already, so server pages can render an accordion directly.
 */

/** Props for {@link Accordion}: Base UI's root props. */
export type AccordionProps = Omit<BaseAccordion.Root.Props, "className"> & {
  /** Classes merged over the defaults (a hairline above the first item). */
  className?: string;
};

/** List of disclosure items; open several at once unless `multiple={false}`. */
export function Accordion({ className, ...props }: AccordionProps) {
  return (
    <BaseAccordion.Root
      className={cn("border-hairline border-t", className)}
      {...props}
    />
  );
}

/** Props for {@link AccordionItem}: Base UI's item props. */
export type AccordionItemProps = Omit<BaseAccordion.Item.Props, "className"> & {
  /** Classes merged over the defaults (a hairline below the item). */
  className?: string;
};

/** One question and answer. Give it a stable `value` to control it. */
export function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <BaseAccordion.Item
      className={cn("border-hairline border-b", className)}
      {...props}
    />
  );
}

/** Props for {@link AccordionTrigger}. */
export type AccordionTriggerProps = Omit<
  BaseAccordion.Trigger.Props,
  "className" | "children"
> & {
  /** The question. */
  children: ReactNode;
  /** Heading level that wraps the trigger. Default `h3`. */
  headingAs?: HeadingLevel;
  /** Classes merged over the trigger button's defaults. */
  className?: string;
};

/**
 * The question row: a heading wrapping a full-width button, with a plus that
 * turns into a filled minus while the panel is open.
 */
export function AccordionTrigger({
  children,
  headingAs: HeadingTag = "h3",
  className,
  ...props
}: AccordionTriggerProps) {
  return (
    <BaseAccordion.Header render={<HeadingTag />} className="m-0">
      <BaseAccordion.Trigger
        className={cn(
          "group/trigger flex w-full items-center justify-between gap-6 py-6 text-left text-fg text-heading-md transition-colors duration-300 ease-brand hover:text-highlight md:py-7",
          className,
        )}
        {...props}
      >
        <span>{children}</span>
        <span
          aria-hidden
          className="relative grid size-10 shrink-0 place-items-center rounded-full border border-hairline-strong text-fg transition-[background-color,border-color,color,rotate] duration-500 ease-brand group-hover/trigger:border-fg/50 group-data-[panel-open]/trigger:border-transparent group-data-[panel-open]/trigger:bg-fg group-data-[panel-open]/trigger:text-canvas motion-safe:group-data-[panel-open]/trigger:rotate-180 motion-reduce:transition-none"
        >
          <span className="absolute h-[1.5px] w-3.5 rounded-full bg-current" />
          <span className="absolute h-3.5 w-[1.5px] rounded-full bg-current transition-transform duration-500 ease-brand group-data-[panel-open]/trigger:scale-y-0 motion-reduce:transition-none" />
        </span>
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

/** Props for {@link AccordionPanel}. */
export type AccordionPanelProps = Omit<
  BaseAccordion.Panel.Props,
  "className" | "children" | "hiddenUntilFound"
> & {
  /** The answer. */
  children: ReactNode;
  /**
   * Classes for the answer's content box. The panel element itself only
   * animates its height, so padding and type go here.
   */
  className?: string;
};

/** The answer; its height eases open and closed (instant under reduced motion). */
export function AccordionPanel({
  children,
  className,
  ...props
}: AccordionPanelProps) {
  return (
    <BaseAccordion.Panel
      hiddenUntilFound
      className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-500 ease-brand data-[ending-style]:h-0 data-[starting-style]:h-0 motion-reduce:transition-none"
      {...props}
    >
      <div
        className={cn(
          "max-w-3xl pb-7 text-body text-fg-muted md:pr-14 [&_a]:font-semibold [&_a]:text-highlight [&_a]:underline [&_a]:underline-offset-4",
          className,
        )}
      >
        {children}
      </div>
    </BaseAccordion.Panel>
  );
}

/** One entry of a {@link FaqList}. */
export type FaqItem = {
  /** The question; also the item's key, so keep it unique in a list. */
  question: string;
  /** The answer, as text or markup. */
  answer: ReactNode;
};

/** Props for {@link FaqList}. */
export type FaqListProps = {
  /** Questions and answers. Keep the data in the feature's data/ folder. */
  items: FaqItem[];
  /** Heading level of each question. Default `h3`. */
  headingAs?: HeadingLevel;
  /** Classes merged over the accordion root. */
  className?: string;
};

/** A question and answer list rendered as an accordion. */
export function FaqList({ items, headingAs, className }: FaqListProps) {
  return (
    <Accordion className={className}>
      {items.map((item) => (
        <AccordionItem key={item.question}>
          <AccordionTrigger headingAs={headingAs}>
            {item.question}
          </AccordionTrigger>
          <AccordionPanel>{item.answer}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
