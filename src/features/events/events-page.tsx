import type { Event } from "@/lib/types";
import { ClosingSection } from "./closing-section";
import { indexHosts, splitEvents, summarizeEvents } from "./events";
import { EventsHero } from "./hero";
import { PosterWall } from "./poster-wall";
import { Register } from "./register";
import { Upcoming } from "./upcoming";

/**
 * /events, set around the co-branding lockup its events already carry
 * ("Anthropic x Lovable x Hugging Face"): the hero completes "TUM.ai ×" with
 * every co-host from the CMS, then come the upcoming events, the archive as
 * a register by semester, the posters as they were announced, and a close
 * that completes the lockup with the reader's team. A server component: it
 * splits the events at `now` and renders every row, so the only client
 * parts are the register's filter and the dialogs.
 */
export function EventsPage({
  events,
  now,
}: {
  /** Every published event, in any order. */
  events: Event[];
  /** The instant that separates upcoming from past (the render time). */
  now: Date;
}) {
  const { upcoming, past } = splitEvents(events, now);
  const summary = summarizeEvents(events);

  return (
    <main>
      <EventsHero
        summary={summary}
        hosts={indexHosts(events)}
        hasUpcoming={upcoming.length > 0}
      />
      <Upcoming events={upcoming} />
      {past.length > 0 ? (
        <Register events={past} since={summary.since} />
      ) : null}
      <PosterWall events={past} />
      <ClosingSection next={upcoming[0]} />
    </main>
  );
}
