import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { type FaqItem, FaqList } from "./accordion";
import { Container } from "./container";
import { Reveal } from "./reveal";
import { Section, type Tone } from "./section";
import { Eyebrow } from "./typography";

/** Props for {@link FaqSection}. */
export type FaqSectionProps = {
  /** Questions and answers. Keep the data in the feature's data/ folder. */
  items: FaqItem[];
  /** Section title (an `h2`). Default "Frequently asked questions". */
  title?: ReactNode;
  /** Label above the title. Default "FAQ". */
  eyebrow?: ReactNode;
  /** A sentence under the title. */
  lead?: ReactNode;
  /** Extra content under the lead (e.g. a contact link). */
  aside?: ReactNode;
  /** Anchor id of the section; the title gets `${id}-title`. Default "faq". */
  id?: string;
  /** Band tone. Default `paper`. */
  tone?: Tone;
  /** Classes merged over the section. */
  className?: string;
};

/** FAQ band: a sticky heading column beside an accordion of questions. */
export function FaqSection({
  items,
  title = "Frequently asked questions",
  eyebrow = "FAQ",
  lead,
  aside,
  id = "faq",
  tone = "paper",
  className,
}: FaqSectionProps) {
  const titleId = `${id}-title`;
  return (
    <Section
      tone={tone}
      spacing="lg"
      id={id}
      aria-labelledby={titleId}
      className={cn("scroll-mt-header", className)}
    >
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-20">
        <div className="lg:sticky lg:top-(--header-offset) lg:self-start">
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 id={titleId} className="mt-5 text-display-md text-fg">
              {title}
            </h2>
            {lead ? (
              <p className="mt-6 text-fg-muted text-lead">{lead}</p>
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
