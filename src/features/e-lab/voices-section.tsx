import {
  Container,
  QuoteCard,
  Reveal,
  Section,
  SectionHeader,
} from "@tum.ai/ui-kit";
import { isUnoptimizedRemoteImage } from "@/lib/image-optimization";
import type { ELabCopy } from "./data/copy";
import type { TestimonialCard } from "./data/venture-page";
import { getELabVoices, getTestimonialCards } from "./venture-content";

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
              portrait={{
                unoptimized: isUnoptimizedRemoteImage(voice.portraitSrc),
                src: voice.portraitSrc,
                position: voice.portraitPosition,
              }}
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
 * venture slice, picked by the page singleton's person references; the
 * headings from the page copy.
 */
export async function VoicesSection({ copy }: { copy: ELabCopy["voices"] }) {
  const [cards, voices] = await Promise.all([
    getTestimonialCards(),
    getELabVoices(),
  ]);
  return (
    <Section tone="mist" spacing="lg" aria-labelledby="voices-title">
      <Container>
        <SectionHeader
          id="voices-title"
          title={copy.title}
          size="lg"
          layout="stack"
          lead={copy.lead}
        />
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <VoiceColumn
            label={copy.foundersLabel}
            voices={pick(cards, voices.founders)}
            delay={0}
          />
          <VoiceColumn
            label={copy.investorsLabel}
            voices={pick(cards, voices.investors)}
            delay={100}
          />
        </div>
      </Container>
    </Section>
  );
}
