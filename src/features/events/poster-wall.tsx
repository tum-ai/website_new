import {
  BrandPanel,
  Container,
  FallbackImage,
  Section,
  SectionHeader,
} from "@tum.ai/ui-kit";
import { isUnoptimizedRemoteImage } from "@/lib/image-optimization";
import type { Event } from "@/lib/types";
import { getEventsCopy } from "./content";
import { EventDetailsDialog } from "./event-details";
import {
  formatEventDate,
  formatHosts,
  hostsBeyondTitle,
  toEventDetails,
} from "./events";
import { Lockup } from "./lockup";
import { PosterGrid } from "./poster-grid";

/**
 * Every past event as it was announced: its poster, in an exact grid of
 * squares with hairline seams, newest first. The posters bring their own
 * colours, so each tile, set edge to edge with a hairline of the band
 * between, sits under a brand colour layer (a `color` blend of
 * Dark Indigo) that keeps the wall one tone; hovering or focusing a tile
 * fades the layer, shows the poster as it was and names the event and its
 * co-hosts, and a click opens the event. Events without a poster are left out.
 * The tiles load eagerly at low priority, so the wall is complete by the time
 * the reader scrolls to it instead of filling in tile by tile; with motion
 * allowed the tiles are pasted up row by row as they scroll in (PosterGrid).
 * Reads its copy from the content slice itself.
 */
export async function PosterWall({ events }: { events: Event[] }) {
  const posters = events.filter((event): event is Event & { poster: string } =>
    Boolean(event.poster),
  );
  if (posters.length === 0) return null;
  const copy = (await getEventsCopy()).posters;

  return (
    <Section tone="paper" aria-labelledby="posters-title">
      <Container>
        <SectionHeader
          id="posters-title"
          layout="stack"
          title={copy.title}
          lead={copy.lead}
        />
        <PosterGrid className="grid grid-cols-3 gap-px md:grid-cols-4 lg:grid-cols-6">
          {posters.map((event) => (
            <li key={event.id}>
              <PosterTile event={event} />
            </li>
          ))}
        </PosterGrid>
      </Container>
    </Section>
  );
}

function PosterTile({ event }: { event: Event & { poster: string } }) {
  const title = event.title.trim();
  return (
    <EventDetailsDialog
      details={toEventDetails(event)}
      trigger={{
        kind: "bare",
        className:
          "group/poster relative block aspect-square w-full overflow-hidden bg-sunken isolate focus-visible:z-10",
      }}
    >
      <FallbackImage
        src={event.poster}
        alt=""
        fill
        unoptimized={isUnoptimizedRemoteImage(event.poster)}
        loading="eager"
        fetchPriority="low"
        sizes="(min-width: 1024px) 13rem, (min-width: 768px) 25vw, 33vw"
        className="events-poster-image object-cover"
        fallback={<BrandPanel />}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-violet-950 mix-blend-color transition-opacity duration-500 ease-brand group-hover/poster:opacity-0 group-focus-visible/poster:opacity-0 motion-reduce:transition-none"
      />
      <span
        aria-hidden="true"
        className="events-poster-sheet absolute inset-0 bg-violet-950"
      />
      <PosterCaption event={event} title={title} />
      <span className="sr-only">Read More about {title}</span>
    </EventDetailsDialog>
  );
}

/**
 * What the tile is, shown over a scrim while it is hovered or focused: the
 * title as a lockup, then the co-hosts the title doesn't name, or the date
 * when there are none. Decorative: the tile's name already carries the title.
 */
function PosterCaption({ event, title }: { event: Event; title: string }) {
  const hosts = hostsBeyondTitle(event);
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-0 bottom-0 flex translate-y-2 flex-col bg-gradient-to-t from-violet-950/90 via-violet-950/45 to-transparent px-3 pt-14 pb-3 text-left opacity-0 transition-[opacity,translate] duration-300 ease-brand group-hover/poster:translate-y-0 group-hover/poster:opacity-100 group-focus-visible/poster:translate-y-0 group-focus-visible/poster:opacity-100 motion-reduce:translate-y-0 motion-reduce:transition-none sm:px-4 sm:pb-4"
    >
      <span className="line-clamp-2 font-medium text-small text-white leading-snug">
        <Lockup title={title} crossClassName="text-violet-300" />
      </span>
      <span className="mt-1 line-clamp-1 text-meta text-violet-100">
        {hosts.length > 0
          ? `With ${formatHosts(hosts)}`
          : formatEventDate(event.event_date).long}
      </span>
    </span>
  );
}
