import { Container, Section, SectionHeader } from "@/components/ds";
import { DeferredRoomSpread } from "./deferred-room-spread";

/**
 * "In the room": the brand guide's photography principle made literal, an
 * editorial spread of real TUM.ai events on night.
 */
export function RoomSection() {
  return (
    <Section tone="night" spacing="xl" aria-labelledby="room-title">
      <Container>
        <SectionHeader
          id="room-title"
          title="In the room"
          size="lg"
          lead="Talks in packed auditoriums, hackathons that run through the night, and first pitches in front of investors."
        />
        <DeferredRoomSpread />
      </Container>
    </Section>
  );
}
