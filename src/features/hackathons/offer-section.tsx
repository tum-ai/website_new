import {
  Container,
  Ledger,
  Reveal,
  Section,
  SectionHeader,
} from "@tum.ai/ui-kit";
import type { HackathonsCopy } from "./data/copy";

/** A partner's result from one hackathon, as its case study states it. */
export type HackathonOutcome = {
  /** The partner's name. */
  name: string;
  /** "20+". */
  metric: string;
  /** What the figure counts. */
  label: string;
  /** The case in a sentence or two. */
  copy: string;
};

/**
 * The partner's way in on lavender: what a challenge comes with, as plain
 * hairline rows at heading size, and one partner's result as evidence,
 * beside a heading that stays in view while they scroll.
 */
export function OfferSection({
  offer,
  outcome,
}: {
  offer: HackathonsCopy["offer"];
  outcome?: HackathonOutcome;
}) {
  return (
    <Section tone="lavender" spacing="lg" aria-labelledby="offer-title">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <SectionHeader
              id="offer-title"
              layout="stack"
              className="lg:sticky lg:top-[calc(var(--header-height)+2rem)]"
              title={offer.title}
              lead={offer.lead}
            />
          </div>
          <div className="lg:col-span-7 lg:pt-3">
            <Reveal>
              <ul className="border-hairline-strong border-t">
                {offer.items.map((item) => (
                  <li
                    key={item}
                    className="border-hairline border-b py-5 text-fg text-heading-md md:py-6"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-fg-muted text-small">{offer.addOns}</p>
            </Reveal>
            {outcome ? (
              <Reveal delay={100} className="mt-14 md:mt-20">
                <Ledger
                  size="lg"
                  items={[
                    {
                      label: `${outcome.name}: ${outcome.label}`,
                      value: outcome.metric,
                      note: outcome.copy,
                    },
                  ]}
                />
              </Reveal>
            ) : null}
          </div>
        </div>
      </Container>
    </Section>
  );
}
