import type { ReactNode } from "react";
import { type FaqItem, FaqList } from "./accordion";
import { Container } from "./container";
import { Reveal } from "./reveal";
import { Section, type Tone } from "./section";
import { Eyebrow } from "./typography";

type FaqSectionProps = {
  items: FaqItem[];
  title?: ReactNode;
  eyebrow?: ReactNode;
  lead?: ReactNode;
  /** Extra content under the lead (e.g. a contact link). */
  aside?: ReactNode;
  id?: string;
  tone?: Tone;
};

/** Sticky heading column + accordion. */
export function FaqSection({
  items,
  title = "Frequently asked questions",
  eyebrow = "FAQ",
  lead,
  aside,
  id = "faq",
  tone = "paper",
}: FaqSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Section tone={tone} spacing="lg" id={id} aria-labelledby={titleId}>
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 id={titleId} className="mt-5 text-display-md text-fg">
              {title}
            </h2>
            {lead ? (
              <p className="mt-6 text-lead text-fg-muted">{lead}</p>
            ) : null}
            {aside ? <div className="mt-8">{aside}</div> : null}
          </Reveal>
        </div>
        <Reveal delay={120}>
          <FaqList items={items} />
        </Reveal>
      </Container>
    </Section>
  );
}
