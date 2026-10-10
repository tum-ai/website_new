import {
  Container,
  QuoteCard,
  Reveal,
  Section,
  SectionHeader,
} from "@tum.ai/ui-kit";
import type { CSSProperties } from "react";
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

/** Grid placement of one column's label and quotes from `lg` up. */
const COLUMN = {
  founders: "lg:col-start-1",
  investors: "lg:col-start-2",
} as const;

/**
 * One group of quotes under its label. The list takes no box of its own
 * (`contents`), so from `lg` up its quotes sit in the section's shared grid:
 * the n-th quote of each group shares row n + 1 (row 1 holds the labels),
 * and the rules above them line up however long each quote runs. Below
 * `lg` the groups stack, each under its label.
 */
function VoiceGroup({
  label,
  voices,
  column,
  delay,
}: {
  label: string;
  voices: TestimonialCard[];
  column: keyof typeof COLUMN;
  delay: number;
}) {
  return (
    <>
      <h3
        className={`${COLUMN[column]} font-semibold text-fg-muted text-small lg:row-start-1 ${
          column === "investors" ? "mt-4 lg:mt-0" : ""
        } -mb-6`}
      >
        {label}
      </h3>
      {/* role="list": Safari drops list semantics from display: contents. */}
      {/* biome-ignore lint/a11y/noRedundantRoles: see above */}
      <ul role="list" className="contents">
        {voices.map((voice, index) => (
          <Reveal
            as="li"
            key={voice.id}
            delay={delay}
            className={`${COLUMN[column]} lg:[grid-row:var(--voice-row)]`}
            style={{ "--voice-row": index + 2 } as CSSProperties}
          >
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
          </Reveal>
        ))}
      </ul>
    </>
  );
}

/**
 * Founders from earlier cohorts beside the investors and partners who work
 * with them, as two columns of ruled quotes whose rows line up. The quotes
 * come from the venture slice, picked by the page singleton's person
 * references; the headings from the page copy.
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
        <div className="grid gap-y-12 lg:grid-cols-2 lg:gap-x-24">
          <VoiceGroup
            label={copy.foundersLabel}
            voices={pick(cards, voices.founders)}
            column="founders"
            delay={0}
          />
          <VoiceGroup
            label={copy.investorsLabel}
            voices={pick(cards, voices.investors)}
            column="investors"
            delay={100}
          />
        </div>
      </Container>
    </Section>
  );
}
