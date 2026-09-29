import {
  Container,
  QuoteCard,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import {
  eLabVoices,
  type TestimonialCard,
  testimonialCards,
} from "./data/venture-page";

const pick = (ids: readonly string[]) =>
  ids.flatMap((id) => {
    const card = testimonialCards.find((entry) => entry.id === id);
    return card ? [card] : [];
  });

/** One column of quotes under its group label. */
function VoiceColumn({
  label,
  voices,
  delay,
}: {
  label: string;
  voices: TestimonialCard[];
  delay: number;
}) {
  return (
    <Reveal delay={delay}>
      <h3 className="font-semibold text-fg-muted text-small">{label}</h3>
      <ul className="mt-6 space-y-12">
        {voices.map((voice) => (
          <li key={voice.id}>
            <QuoteCard
              variant="ruled"
              quote={voice.quote}
              name={voice.name}
              byline={voice.role}
              portrait={{ src: voice.portraitSrc }}
              context={
                voice.context ? (
                  <span className="text-fg-subtle text-meta">
                    {voice.context}
                  </span>
                ) : null
              }
            />
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

/**
 * Founders from earlier cohorts beside the investors and partners who work
 * with them, as two columns of ruled quotes.
 */
export function VoicesSection() {
  return (
    <Section tone="mist" spacing="lg" aria-labelledby="voices-title">
      <Container>
        <SectionHeader
          id="voices-title"
          title="Founders and investors on the E-Lab."
          size="lg"
          layout="stack"
          lead="Founders from earlier cohorts, and investors and partners who work with the E-Lab."
        />
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <VoiceColumn
            label="Founders"
            voices={pick(eLabVoices.founders)}
            delay={0}
          />
          <VoiceColumn
            label="Investors and partners"
            voices={pick(eLabVoices.investors)}
            delay={100}
          />
        </div>
      </Container>
    </Section>
  );
}
