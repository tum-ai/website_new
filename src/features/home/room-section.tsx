import { Container, Section, SectionHeader } from "@/components/ds";
import type { HomeCopy } from "./data/homepage";
import { DeferredRoomSpread } from "./deferred-room-spread";

/**
 * "In the room": the brand guide's photography principle made literal, an
 * editorial spread of real TUM.ai events on night.
 */
export function RoomSection({ room }: { room: HomeCopy["room"] }) {
  return (
    <Section tone="night" spacing="xl" aria-labelledby="room-title">
      <Container>
        <SectionHeader
          id="room-title"
          title={room.title}
          size="lg"
          lead={room.lead}
        />
        <DeferredRoomSpread photos={room.photos} />
      </Container>
    </Section>
  );
}
