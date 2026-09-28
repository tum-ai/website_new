"use client";

import { ArrowDown, CalendarSearch, X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  type RefObject,
  use,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Container,
  EmptyState,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { cn } from "@/lib/cn";
import {
  countFilterOptions,
  DEFAULT_EVENT_FILTERS,
  type EventFilters,
  type FilterableEvent,
  type FilterCounts,
  matchesFilters,
} from "./filters";

/**
 * One event in the filter island: the fields the filters read, plus its
 * card, already rendered on the server.
 */
type EventEntry = FilterableEvent & {
  /** Unique per event; the React key. */
  id: string;
  /** The server-rendered card. */
  card: ReactNode;
};

/** A calendar month of entries, grouped (in Munich time) on the server. */
export type EventMonthEntries = {
  /** `yyyy-MM`; the React key. */
  key: string;
  /** "October". */
  monthName: string;
  /** "2026". */
  year: string;
  /** The month's events in display order. */
  entries: EventEntry[];
};

type EventsFilterState = {
  filters: EventFilters;
  setFilters: (filters: EventFilters) => void;
  /** Resets the filters and moves focus to the selected category chip. */
  clearFilters: () => void;
  /** The filter panel's chip area, where `clearFilters` puts focus. */
  chipsRef: RefObject<HTMLDivElement | null>;
  /** Per-chip counts over every event. */
  counts: FilterCounts;
  /** The upcoming months that still have events under the filters. */
  upcoming: EventMonthEntries[];
  /** The past months that still have events under the filters. */
  past: EventMonthEntries[];
  upcomingCount: number;
  pastCount: number;
};

const EventsFilterContext = createContext<EventsFilterState | null>(null);

/** The filter state; only inside {@link EventsFilterProvider}. */
export function useEventsFilter(): EventsFilterState {
  const state = use(EventsFilterContext);
  if (!state) {
    throw new Error("useEventsFilter needs an <EventsFilterProvider>.");
  }
  return state;
}

function filterMonths(
  months: EventMonthEntries[],
  filters: EventFilters,
): EventMonthEntries[] {
  return months
    .map((month) => ({
      ...month,
      entries: month.entries.filter((entry) => matchesFilters(entry, filters)),
    }))
    .filter((month) => month.entries.length > 0);
}

const countEntries = (months: EventMonthEntries[]) =>
  months.reduce((sum, month) => sum + month.entries.length, 0);

/**
 * The /events filter island. The server splits the events into upcoming and
 * past, groups them by month and renders every card; this only holds the
 * chip selection and filters those groups, so nothing here depends on the
 * clock or the visitor's timezone. The page's server markup (hero, headings)
 * sits inside it; {@link EventFiltersPanel}, {@link EventTotals} and
 * {@link EventListings} read the state.
 */
export function EventsFilterProvider({
  upcoming,
  past,
  children,
}: {
  /** Upcoming months, soonest first. */
  upcoming: EventMonthEntries[];
  /** Past months, newest first. */
  past: EventMonthEntries[];
  children: ReactNode;
}) {
  const [filters, setFilters] = useState<EventFilters>(DEFAULT_EVENT_FILTERS);
  const chipsRef = useRef<HTMLDivElement>(null);

  const state = useMemo<EventsFilterState>(() => {
    const all = [...upcoming, ...past].flatMap((month) => month.entries);
    const visibleUpcoming = filterMonths(upcoming, filters);
    const visiblePast = filterMonths(past, filters);
    return {
      filters,
      setFilters,
      clearFilters: () => {
        setFilters(DEFAULT_EVENT_FILTERS);
        // The Clear button unmounts; keep keyboard focus in the chips.
        requestAnimationFrame(() => {
          chipsRef.current
            ?.querySelector<HTMLElement>('[aria-pressed="true"]')
            ?.focus();
        });
      },
      chipsRef,
      counts: countFilterOptions(all, filters),
      upcoming: visibleUpcoming,
      past: visiblePast,
      upcomingCount: countEntries(visibleUpcoming),
      pastCount: countEntries(visiblePast),
    };
  }, [filters, upcoming, past]);

  return <EventsFilterContext value={state}>{children}</EventsFilterContext>;
}

/**
 * Hero figures for the current filter result. Each links to its section when
 * that section is on the page.
 */
export function EventTotals() {
  const { upcomingCount, pastCount } = useEventsFilter();
  const items = [
    {
      label: "Upcoming Events",
      value: upcomingCount,
      href: "#upcoming-events",
      live: true,
    },
    {
      label: "Past Events",
      value: pastCount,
      href: "#past-events",
      live: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 border-hairline-strong border-t lg:ml-auto lg:max-w-md">
      {items.map((item, index) => {
        const content = (
          <>
            <span className="flex items-center gap-2 font-medium text-fg-muted text-small">
              {item.live && item.value > 0 ? (
                <span aria-hidden className="relative flex size-2">
                  <span className="absolute inset-0 rounded-full bg-indicator motion-safe:animate-pulse-ring" />
                  <span className="relative size-2 rounded-full bg-indicator" />
                </span>
              ) : null}
              {item.label}
            </span>
            <span className="mt-auto flex items-end justify-between gap-3 pt-4">
              <span className="tabular text-fg text-stat-xl">{item.value}</span>
              {item.value > 0 ? (
                <ArrowDown
                  aria-hidden
                  className="mb-1.5 size-5 text-fg-subtle transition-[translate,color] duration-500 ease-brand group-hover/total:translate-y-1 group-hover/total:text-fg motion-reduce:transition-none"
                />
              ) : null}
            </span>
          </>
        );
        const className = cn(
          "group/total flex flex-col pt-5 pb-1",
          index === 0
            ? "border-hairline border-r pr-5 sm:pr-8"
            : "pl-5 sm:pl-8",
        );
        return item.value > 0 ? (
          <a key={item.label} href={item.href} className={className}>
            {content}
          </a>
        ) : (
          <div key={item.label} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Upcoming months. On wide screens the month label sticks beside its events
 * while they scroll past.
 */
function UpcomingMonths({ months }: { months: EventMonthEntries[] }) {
  return (
    <div className="space-y-16 md:space-y-24">
      {months.map((month) => (
        <div
          key={month.key}
          className="grid gap-6 md:gap-8 xl:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] xl:gap-12 2xl:grid-cols-[minmax(0,16rem)_minmax(0,1fr)]"
        >
          <Reveal className="flex items-center gap-4 xl:sticky xl:top-[calc(var(--header-height)+2.5rem)] xl:block xl:self-start">
            <h3 className="flex shrink-0 items-baseline gap-2 text-fg text-heading-lg xl:block">
              <span className="xl:block xl:text-display-md">
                {month.monthName}
              </span>{" "}
              <span className="tabular text-fg-subtle xl:mt-2 xl:block xl:text-heading-md">
                {month.year}
              </span>
            </h3>
            <span
              aria-hidden
              className="h-px flex-1 bg-hairline-strong xl:mt-6 xl:block xl:w-12 xl:flex-none"
            />
            <p className="shrink-0 text-fg-subtle text-meta xl:mt-4">
              {month.entries.length}{" "}
              {month.entries.length === 1 ? "event" : "events"}
            </p>
          </Reveal>
          <div className="space-y-6 md:space-y-8">
            {month.entries.map((entry, index) => (
              <Reveal key={entry.id} delay={index * 80}>
                {entry.card}
              </Reveal>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Past events in a compact photo grid. Month groups read as a rail: the
 * first event of each month carries the label and the hairline continues
 * over the rest of that month.
 */
function PastMonths({ months }: { months: EventMonthEntries[] }) {
  return (
    <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 md:gap-y-16 lg:grid-cols-3 lg:gap-x-8">
      {months.flatMap((month) =>
        month.entries.map((entry, index) => (
          <Reveal key={entry.id} className="flex flex-col">
            <div className="mb-5 flex h-5 items-center gap-3">
              {index === 0 ? (
                <h3 className="flex shrink-0 items-center gap-2.5 text-eyebrow text-highlight">
                  <span
                    aria-hidden
                    className="size-1.5 rounded-full bg-current"
                  />
                  {month.monthName} {month.year}
                </h3>
              ) : null}
              <span aria-hidden className="h-px flex-1 bg-hairline-strong" />
            </div>
            {entry.card}
          </Reveal>
        )),
      )}
    </div>
  );
}

/**
 * The filtered sections: "Upcoming Events" and "Past Events", each shown
 * only while it has a match, or an empty state when nothing matches.
 */
export function EventListings() {
  const { upcoming, past, upcomingCount, pastCount, clearFilters } =
    useEventsFilter();

  return (
    <>
      {upcomingCount + pastCount === 0 ? (
        <Section tone="paper" spacing="md">
          <Container size="narrow">
            <EmptyState
              icon={CalendarSearch}
              title="No events found matching your filters."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  <X aria-hidden className="size-4" />
                  Clear
                </Button>
              }
            >
              Try adjusting your search criteria.
            </EmptyState>
          </Container>
        </Section>
      ) : null}

      {upcomingCount > 0 ? (
        <Section
          tone="paper"
          id="upcoming-events"
          aria-labelledby="upcoming-events-title"
          className="scroll-mt-header"
        >
          <Container>
            <SectionHeader
              id="upcoming-events-title"
              eyebrow="Calendar"
              index={1}
              layout="stack"
              title="Upcoming Events"
              count={upcomingCount}
            />
            <UpcomingMonths months={upcoming} />
          </Container>
        </Section>
      ) : null}

      {pastCount > 0 ? (
        <Section
          tone="mist"
          id="past-events"
          aria-labelledby="past-events-title"
          className="scroll-mt-header"
        >
          <Container>
            <SectionHeader
              id="past-events-title"
              eyebrow="Archive"
              index={upcomingCount > 0 ? 2 : 1}
              layout="stack"
              title="Past Events"
              count={pastCount}
            />
            <PastMonths months={past} />
          </Container>
        </Section>
      ) : null}
    </>
  );
}
