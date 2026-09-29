import {
  Container,
  QuoteCard,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { eLabVoices, type TestimonialCard } from "./data/venture-page";
import { getTestimonialCards } from "./venture-content";

/** The testimonials with `ids`, in that order; unknown ids are skipped. */
const pick = (cards: readonly TestimonialCard[], ids: readonly string[]) =>
  ids.flatMap((id) => {
    const card = cards.find((entry) => entry.id === id);
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
 * with them, as two columns of ruled quotes. The quotes come from the
 * venture slice (the CMS or the code), picked by id (`eLabVoices`).
 */
export async function VoicesSection() {
  const cards = await getTestimonialCards();
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
            voices={pick(cards, eLabVoices.founders)}
            delay={0}
          />
          <VoiceColumn
            label="Investors and partners"
            voices={pick(cards, eLabVoices.investors)}
            delay={100}
          />
        </div>
      </Container>
    </Section>
  );
}
