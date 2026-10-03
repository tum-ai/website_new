import { JsonLd } from "@/components/json-ld";
import { buildMetadata, getJsonLd } from "@/config/seo";
import { HackathonsPage } from "@/features/hackathons/hackathons-page";
import "@tum.ai/ui-kit/halftone.css";
import "@/features/hackathons/hackathons.css";
import { getCmsNow } from "@/lib/mock-cms-env";
import { getSanityEvents } from "@/lib/sanity";

export const metadata = buildMetadata("hackathons");

/**
 * ISR every 5 minutes, as /events: the render time decides which
 * hackathons are past, which is next and the league's register, so those
 * are as fresh as the cached page.
 */
export const revalidate = 300;

export default async function Page() {
  const now = getCmsNow();
  const events = await getSanityEvents();
  return (
    <>
      <JsonLd data={getJsonLd("hackathons")} />
      <HackathonsPage events={events} now={now} />
    </>
  );
}
