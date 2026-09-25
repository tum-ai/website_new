"use client";

import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Accordion built on Base UI (keyboard, ARIA and focus handled there).
 * Panels stay in the DOM with `hidden="until-found"`, so browser find-in-page
 * and crawlers still see the answers.
 */
export function Accordion({
  className,
  ...props
}: BaseAccordion.Root.Props & { className?: string }) {
  return (
    <BaseAccordion.Root
      className={cn("border-t border-hairline", className)}
      {...props}
    />
  );
}

export function AccordionItem({
  className,
  ...props
}: BaseAccordion.Item.Props & { className?: string }) {
  return (
    <BaseAccordion.Item
      className={cn("border-b border-hairline", className)}
      {...props}
    />
  );
}

export function AccordionTrigger({
  children,
  headingAs: HeadingTag = "h3",
  className,
}: {
  children: ReactNode;
  headingAs?: "h2" | "h3" | "h4";
  className?: string;
}) {
  return (
    <BaseAccordion.Header render={<HeadingTag />} className="m-0">
      <BaseAccordion.Trigger
        className={cn(
          "group/trigger flex w-full items-center justify-between gap-6 py-6 text-left text-heading-md text-fg transition-colors duration-300 hover:text-highlight md:py-7",
          className,
        )}
      >
        <span>{children}</span>
        <span
          aria-hidden
          className="relative grid size-10 shrink-0 place-items-center rounded-full border border-hairline-strong text-fg transition-[background-color,border-color,color,rotate] duration-500 ease-brand group-hover/trigger:border-fg/50 group-data-[panel-open]/trigger:rotate-180 group-data-[panel-open]/trigger:border-transparent group-data-[panel-open]/trigger:bg-fg group-data-[panel-open]/trigger:text-canvas"
        >
          <span className="absolute h-[1.5px] w-3.5 rounded-full bg-current" />
          <span className="absolute h-3.5 w-[1.5px] rounded-full bg-current transition-transform duration-500 ease-brand group-data-[panel-open]/trigger:scale-y-0" />
        </span>
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  );
}

export function AccordionPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <BaseAccordion.Panel
      hiddenUntilFound
      className="h-(--accordion-panel-height) overflow-hidden transition-[height] duration-500 ease-brand data-[ending-style]:h-0 data-[starting-style]:h-0 motion-reduce:transition-none"
    >
      <div
        className={cn(
          "max-w-3xl pr-14 pb-7 text-body text-fg-muted [&_a]:font-semibold [&_a]:text-highlight [&_a]:underline [&_a]:underline-offset-4",
          className,
        )}
      >
        {children}
      </div>
    </BaseAccordion.Panel>
  );
}

export type FaqItem = { question: string; answer: ReactNode };

/** Question/answer list. Keep the data in src/data; this only renders it. */
export function FaqList({
  items,
  headingAs,
  className,
}: {
  items: FaqItem[];
  headingAs?: "h2" | "h3" | "h4";
  className?: string;
}) {
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
