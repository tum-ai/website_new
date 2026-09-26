import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { EventsPage } from "@/features/events/events-page";
import { getSanityEvents } from "@/lib/sanity";

export const metadata = buildMetadata("events");
export const revalidate = 300;

export default async function Page() {
  const events = await getSanityEvents();

  return (
    <>
      <JsonLd data={getJsonLd("events")} />
      <EventsPage initialEvents={events} />
    </>
  );
}
