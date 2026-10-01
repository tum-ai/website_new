import type { Event } from "@/lib/types";
import { ClosingSection } from "./closing-section";
import {
  indexHosts,
  pinFeaturedEvent,
  recentSemesterEvents,
  splitEvents,
  summarizeEvents,
} from "./events";
import { EventsHero } from "./hero";
import { PosterWall } from "./poster-wall";
import { Register } from "./register";
import { Upcoming } from "./upcoming";

/**
 * /events, set around the co-branding lockup its events already carry
 * ("Anthropic x Lovable x Hugging Face"): the hero completes "TUM.ai ×" with
 * every co-host from the CMS, then come the upcoming events, the recent
 * semesters as a register, every past event's poster as it was announced
 * (the whole archive, a pin wall), and a close
 * that completes the lockup with the reader's team. A running campaign's
 * featured event leads the upcoming events and the close while it is
 * upcoming. A server component: it splits the events at `now` and renders
 * every row, so the only client parts are the register's filter and the
 * dialogs.
 */
export function EventsPage({
  events,
  now,
  featuredEventId = null,
}: {
  /** Every published event, in any order. */
  events: Event[];
  /** The instant that separates upcoming from past (the render time). */
  now: Date;
  /** The `_id` of the event a running campaign features, if any. */
  featuredEventId?: string | null;
}) {
  const split = splitEvents(events, now);
  const { past } = split;
  const upcoming = pinFeaturedEvent(split.upcoming, featuredEventId);
  const summary = summarizeEvents(events);
  // The register lists the last few semesters; the poster wall keeps every
  // past event. Its lead says since when, from the rows it lists.
  const recent = recentSemesterEvents(past);

  return (
    <main>
      <EventsHero
        summary={summary}
        hosts={indexHosts(events)}
        hasUpcoming={upcoming.length > 0}
      />
      <Upcoming events={upcoming} />
      {recent.length > 0 ? (
        <Register events={recent} since={summarizeEvents(recent).since} />
      ) : null}
      <PosterWall events={past} />
      <ClosingSection next={upcoming[0]} />
    </main>
  );
}
