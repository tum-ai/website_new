"use client";

import { Fragment, type ReactNode, useState } from "react";
import { FaqList, TextLink } from "@/components/ds";
import type { PassageSegment } from "./mission-spans";

/** A question as the island receives it: its anchor id and rendered answer. */
export type AnswerItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

type MissionAnswersProps = {
  /** The mission passage, cut into plain and marked runs. */
  segments: PassageSegment[];
  /** The questions, in passage order; the first starts open. */
  items: AnswerItem[];
  /** Questions the passage doesn't answer, listed under it. */
  unmarked: { id: string; question: string }[];
};

/**
 * The passage and the questions, sharing which question is open. The passage
 * reads in the subtle tone; the words that answer the open question turn ink
 * with an accent underline, the way an extractive QA set marks its answer
 * span. Nothing is marked at rest beyond that one answer.
 */
export function MissionAnswers({
  segments,
  items,
  unmarked,
}: MissionAnswersProps) {
  const [open, setOpen] = useState<string[]>(
    items[0] ? [items[0].question] : [],
  );
  const openId = items.find((item) => open.includes(item.question))?.id;

  return (
    <div className="grid gap-14 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-7">
        <div className="lg:sticky lg:top-(--header-offset)">
          <p
            id="mission-passage"
            className="font-light text-fg-subtle text-heading-lg"
          >
            {segments.map((segment) =>
              segment.id ? (
                <span
                  key={segment.start}
                  data-answers={segment.id}
                  data-active={segment.id === openId ? "" : undefined}
                  className="underline decoration-2 decoration-transparent underline-offset-[0.22em] transition-[color,text-decoration-color] duration-500 ease-brand data-active:text-fg data-active:decoration-highlight motion-reduce:transition-none"
                >
                  {segment.text}
                </span>
              ) : (
                <Fragment key={segment.start}>{segment.text}</Fragment>
              ),
            )}
          </p>
          {unmarked.length > 0 ? (
            <p className="mt-8 max-w-xl text-fg-muted text-small">
              Not in the paragraph:{" "}
              {unmarked.map((entry, index) => (
                <Fragment key={entry.id}>
                  {index > 0 ? ", " : null}
                  <TextLink
                    href={`#${entry.id}`}
                    // FaqList opens the item on the fragment change; a
                    // fragment that is already current fires none.
                    onClick={() => {
                      if (window.location.hash === `#${entry.id}`) {
                        setOpen([entry.question]);
                      }
                    }}
                  >
                    {entry.question}
                  </TextLink>
                </Fragment>
              ))}
            </p>
          ) : null}
        </div>
      </div>
      <FaqList
        items={items}
        value={open}
        onValueChange={setOpen}
        className="lg:col-span-5"
      />
    </div>
  );
}
