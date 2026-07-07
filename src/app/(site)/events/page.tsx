import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { getSanityEvents } from "@/lib/sanity";
import Events from "@/views/headerPages/Events";

export const metadata = buildMetadata("events");
export const revalidate = 300;

export default async function Page() {
  const events = await getSanityEvents();

  return (
    <>
      <JsonLd data={getJsonLd("events")} />
      <Events initialEvents={events} />
    </>
  );
}
