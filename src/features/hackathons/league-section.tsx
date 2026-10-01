import {
  ButtonLink,
  Container,
  KeyDates,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import type { hackathonsView } from "./hackathons-view";

type View = ReturnType<typeof hackathonsView>;

/**
 * The league on ink: that TUM.ai founded it, and its season as a register
 * of dates, played matches struck through and the next one lit. The
 * standings and rules live on the league's own site, which the band links
 * to rather than repeats.
 */
export function LeagueSection({ league }: { league: View["league"] }) {
  return (
    <Section tone="ink" spacing="lg" aria-labelledby="league-title">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <SectionHeader
            id="league-title"
            layout="stack"
            size="lg"
            className="lg:col-span-6"
            title={league.title}
            lead={league.lead}
            actions={
              <ButtonLink href={league.url} variant="inverse" arrow="external">
                {league.linkLabel}
              </ButtonLink>
            }
          />
          <Reveal className="lg:col-span-6 lg:pt-3">
            <KeyDates items={league.dates} size="lg" />
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
