import JsonLd from "@/components/JsonLd";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { getEvents } from "@/lib/notion";
import Events from "@/views/headerPages/Events";

export const metadata = buildMetadata("events");
export const revalidate = 300;

export default async function Page() {
  const events = await getEvents();

  return (
    <>
      <JsonLd data={getJsonLd("events")} />
      <Events initialEvents={events} />
    </>
  );
}
