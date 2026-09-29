"use client";

import { type ReactNode, useEffect, useEffectEvent, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "./accordion";
import type { HeadingLevel } from "./types";

/*
 * A client island (unlike the Accordion parts) because it listens for the
 * URL fragment: a link to an item's `id` opens that item, on load and on
 * every later `hashchange`.
 */

/** One entry of a {@link FaqList}. */
export type FaqItem = {
  /** The question; also the item's key, so keep it unique in a list. */
  question: string;
  /** The answer, as text or markup. */
  answer: ReactNode;
  /**
   * Anchor id of the item, so a link to `#id` scrolls to the question and
   * opens its answer. Unique on the page.
   */
  id?: string;
};

/** Props for {@link FaqList}. */
export type FaqListProps = {
  /** Questions and answers. Keep the data in the feature's data/ folder. */
  items: FaqItem[];
  /**
   * Questions whose answers start open, e.g. `[items[0].question]` to open
   * the first. Each item's value is its question. Ignored when `value` is set.
   */
  defaultValue?: string[];
  /**
   * The open questions, for a list whose state lives in the parent (with
   * `onValueChange`). Leave unset to let the list keep its own state.
   */
  value?: string[];
  /** Called with the open questions whenever the reader opens or closes one. */
  onValueChange?: (value: string[]) => void;
  /** Heading level of each question. Default `h3`. */
  headingAs?: HeadingLevel;
  /** Classes merged over the accordion root. */
  className?: string;
};

/** The item whose `id` the URL fragment names, if any. */
function itemFromHash(items: FaqItem[]) {
  const hash = decodeURIComponent(window.location.hash.slice(1));
  return hash ? items.find((item) => item.id === hash) : undefined;
}

/**
 * A question and answer list rendered as an accordion, one answer open at a
 * time. Items with an `id` are deep-linkable.
 */
export function FaqList({
  items,
  defaultValue,
  value,
  onValueChange,
  headingAs,
  className,
}: FaqListProps) {
  const [ownValue, setOwnValue] = useState<string[]>(defaultValue ?? []);
  const open = value ?? ownValue;

  const change = (next: string[]) => {
    if (value === undefined) setOwnValue(next);
    onValueChange?.(next);
  };

  const openFromHash = useEffectEvent(() => {
    const item = itemFromHash(items);
    if (item && !open.includes(item.question)) change([item.question]);
  });

  /*
   * Subscribes once, on mount, so a re-render never re-applies a fragment the
   * reader has since closed.
   */
  useEffect(() => {
    const onHashChange = () => openFromHash();
    openFromHash();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <Accordion
      value={open}
      onValueChange={(next) => change(next as string[])}
      className={className}
    >
      {items.map((item) => (
        <AccordionItem
          key={item.question}
          value={item.question}
          id={item.id}
          className={item.id ? "scroll-mt-header" : undefined}
        >
          <AccordionTrigger headingAs={headingAs}>
            {item.question}
          </AccordionTrigger>
          <AccordionPanel>{item.answer}</AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
