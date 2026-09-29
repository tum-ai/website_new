import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { EventsPage } from "@/features/events/events-page";
import "@/features/events/events.css";
import { getCmsNow } from "@/lib/mock-cms-env";
import { getSanityEvents } from "@/lib/sanity";

export const metadata = buildMetadata("events");

/**
 * ISR every 5 minutes. The page is rendered on the server, and that render
 * time is the `now` that splits upcoming from past events, so the split is
 * only as fresh as the cached page: an event that has just started stays
 * under "Upcoming" until a request more than 5 minutes after the last render
 * triggers a new one (that request still gets the old page). Content edits
 * refresh sooner through `<SanityLive>`.
 *
 * The trade-off: rendering per request, or computing the split in the
 * browser, would be exact to the second, but the first loses the static
 * cache and the second makes server and client disagree during hydration
 * (and depends on the visitor's clock and timezone). A few minutes of lag
 * on an event's start is harmless for this page.
 */
export const revalidate = 300;

export default async function Page() {
  const events = await getSanityEvents();

  return (
    <>
      <JsonLd data={getJsonLd("events")} />
      <EventsPage events={events} now={getCmsNow()} />
    </>
  );
}
