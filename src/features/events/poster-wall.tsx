import {
  BrandPanel,
  Container,
  FallbackImage,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import type { Event } from "@/lib/types";
import { EventDetailsDialog } from "./event-details";
import { toEventDetails } from "./events";

/**
 * Every past event as it was announced: its poster, in an exact grid of
 * squares with hairline seams, newest first. The posters bring their own
 * colours, so each tile, set edge to edge with a hairline of the band
 * between, sits under a brand colour layer (a `color` blend of
 * Dark Indigo) that keeps the wall one tone; hovering or focusing a tile
 * fades the layer and shows the poster as it was, and a click opens the
 * event. Events without a poster are left out.
 */
export function PosterWall({ events }: { events: Event[] }) {
  const posters = events.filter((event): event is Event & { poster: string } =>
    Boolean(event.poster),
  );
  if (posters.length === 0) return null;

  return (
    <Section tone="paper" aria-labelledby="posters-title">
      <Container>
        <SectionHeader
          id="posters-title"
          layout="stack"
          title="As announced"
          lead="The poster of every past event, newest first."
        />
        <Reveal variant="fade">
          <ul className="grid grid-cols-3 gap-px md:grid-cols-4 lg:grid-cols-6">
            {posters.map((event) => (
              <li key={event.id}>
                <PosterTile event={event} />
              </li>
            ))}
          </ul>
        </Reveal>
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
        unoptimized
        sizes="(min-width: 1024px) 13rem, (min-width: 768px) 25vw, 33vw"
        className="object-cover"
        fallback={<BrandPanel />}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-violet-950 mix-blend-color transition-opacity duration-500 ease-brand group-hover/poster:opacity-0 group-focus-visible/poster:opacity-0 motion-reduce:transition-none"
      />
      <span className="sr-only">Read More about {title}</span>
    </EventDetailsDialog>
  );
}
