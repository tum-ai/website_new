"use client";

import { ChipGroup, Reveal } from "@tum.ai/ui-kit";
import { type ReactNode, useMemo, useState } from "react";
import type { EventCategory } from "@/lib/types";
import {
  ALL_EVENTS,
  countFilterOptions,
  type EventFilter,
  filterLabel,
  filterValues,
  matchesFilter,
  toFilter,
} from "./filters";

/** One past event in the island: the field the filter reads and its row. */
type RegisterEntry = {
  /** Unique per event; the React key. */
  id: string;
  category?: EventCategory;
  /** The server-rendered row. */
  row: ReactNode;
};

/** A semester of the register, grouped (in Munich time) on the server. */
export type RegisterSemester = {
  /** "2026-summer"; the React key. */
  key: string;
  /** "Summer semester 2026". */
  label: string;
  /** The semester's events, newest first. */
  entries: RegisterEntry[];
};

/**
 * The register's category chips and its semester groups. The server renders
 * every row; this only holds the selected chip and hides what doesn't match.
 * Chips without events are left out, so every choice has results and the
 * register never empties, and a selection that a live refresh leaves without
 * events falls back to All.
 */
export function RegisterFilter({
  semesters,
}: {
  /** Semesters, newest first. */
  semesters: RegisterSemester[];
}) {
  const [selected, setSelected] = useState<EventFilter>(ALL_EVENTS);
  const entries = useMemo(
    () => semesters.flatMap((semester) => semester.entries),
    [semesters],
  );
  const counts = useMemo(() => countFilterOptions(entries), [entries]);
  const options = filterValues.filter((value) => counts[value] > 0);
  const hasChips = options.length > 2;
  // A live refresh can take away the selected category's last event, or
  // every choice but one (and with it the chips): the register then shows
  // every event, and the selection resets so it doesn't return by itself.
  const filter = hasChips && options.includes(selected) ? selected : ALL_EVENTS;
  if (filter !== selected) setSelected(filter);
  const visible = semesters
    .map((semester) => ({
      ...semester,
      entries: semester.entries.filter((entry) => matchesFilter(entry, filter)),
    }))
    .filter((semester) => semester.entries.length > 0);

  return (
    <>
      {hasChips ? (
        <ChipGroup
          label="Category"
          value={filter}
          onValueChange={(value) => setSelected(toFilter(value))}
          options={options.map((value) => ({
            value,
            label: filterLabel(value),
            count: counts[value],
          }))}
        />
      ) : null}
      <p aria-live="polite" className="sr-only">
        {counts[filter]} {counts[filter] === 1 ? "event" : "events"}
      </p>
      <div className="mt-10 space-y-14 md:mt-14 md:space-y-20">
        {visible.map((semester) => (
          <section key={semester.key} aria-labelledby={`${semester.key}-title`}>
            <Reveal className="flex items-baseline justify-between gap-4">
              <h3
                id={`${semester.key}-title`}
                className="text-fg text-heading-lg"
              >
                {semester.label}
              </h3>
              <p className="tabular shrink-0 text-fg-subtle text-small">
                {semester.entries.length}{" "}
                {semester.entries.length === 1 ? "event" : "events"}
              </p>
            </Reveal>
            <ol className="mt-5 border-hairline-strong border-b">
              {semester.entries.map((entry) => (
                <li key={entry.id} className="border-hairline-strong border-t">
                  {entry.row}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
