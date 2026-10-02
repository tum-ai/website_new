/**
 * The backfill's events that exist only in the new site's dataset: the
 * earlier hackathons in `redesignOnlyEvents` (lib/mock-cms.ts), which the
 * old site's `production` never had. They are created like any backfill
 * document (create-only, never on `production`), with their posters and
 * photos from `public/assets/events/hackathons/` and their co-hosts as
 * organisation references. Ids come from each entry's key, so they never
 * collide with the copied production events.
 */
import {
  type BackfillDocument,
  backfillId,
  backfillImage,
} from "@/lib/cms-backfill";
import { redesignOnlyEvents } from "@/lib/mock-cms";
import { organizationReference } from "@/lib/organization-content";

/** The `event` documents of {@link redesignOnlyEvents}, in the schema's shape. */
export function buildRedesignEventsBackfill(): BackfillDocument[] {
  return redesignOnlyEvents.map(
    ({
      key,
      title,
      description,
      event_date,
      end_date,
      location,
      city,
      category,
      coHosts,
      poster,
      images,
    }) => {
      const photo = images?.find((src) => src !== poster);
      return {
        _id: backfillId("event", key),
        _type: "event",
        title,
        desc: description,
        event_date,
        ...(end_date ? { end_date } : {}),
        ...(location ? { location } : {}),
        ...(city ? { city } : {}),
        ...(category ? { category } : {}),
        ...(coHosts?.length
          ? {
              coHosts: coHosts.map(({ key: host }) => ({
                _key: host,
                ...organizationReference(host),
              })),
              // The old site's field, as the copied events carry it.
              hosts: coHosts.map(({ name }) => name),
            }
          : {}),
        ...(poster ? { poster: backfillImage(poster) } : {}),
        ...(photo ? { img: backfillImage(photo) } : {}),
      };
    },
  );
}
