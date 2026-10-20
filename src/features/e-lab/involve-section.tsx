import {
  Container,
  IconBadge,
  Reveal,
  Section,
  Text,
  TextLink,
} from "@tum.ai/ui-kit";
import {
  ArrowRight,
  Gavel,
  Lightbulb,
  type LucideIcon,
  Mic,
  Presentation,
} from "lucide-react";
import { getSiteFacts } from "@/config/site-settings-content";
import {
  type ELabCopy,
  type ELabInvolveKey,
  involveMailUrl,
} from "./data/copy";

const icons: Record<ELabInvolveKey, LucideIcon> = {
  jury: Gavel,
  keynote: Mic,
  workshop: Presentation,
  other: Lightbulb,
};

/**
 * "Get involved": the ways companies and investors take part in the
 * program (jury, keynote, workshop, another idea), each a card that opens a
 * mail to the Venture team (`contactEmails.venture`). The cards share the
 * look of the partners page's finder options.
 */
export async function InvolveSection({ copy }: { copy: ELabCopy["involve"] }) {
  const facts = await getSiteFacts();
  const email = facts.contactEmails.venture;
  if (!copy.options.length) return null;
  return (
    <Section tone="paper" spacing="lg" aria-labelledby="elab-involve-title">
      <Container className="grid gap-10 md:gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-12 xl:gap-20">
        <Reveal className="lg:pt-2">
          <p className="text-eyebrow text-highlight">{copy.eyebrow}</p>
          <h2 id="elab-involve-title" className="mt-5 text-display-md text-fg">
            {copy.title}
          </h2>
          <Text size="lead" className="mt-6 max-w-sm">
            {copy.lead}
          </Text>
          <p className="mt-6 lg:mt-8">
            <TextLink href={`mailto:${email}`} className="text-small">
              {email}
            </TextLink>
          </p>
        </Reveal>
        <Reveal delay={120}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {copy.options.map((option) => (
              <li key={option.key} className="flex">
                <a
                  href={involveMailUrl(email, option.title)}
                  className="group/option flex w-full items-start gap-3.5 rounded-2xl border border-hairline bg-canvas p-4 text-left text-fg transition-colors duration-300 ease-brand hover:border-violet-500/40 hover:bg-violet-50/70 focus-visible:outline-2 focus-visible:outline-violet-500 focus-visible:outline-offset-2 sm:gap-4 md:p-5"
                >
                  <IconBadge
                    icon={icons[option.key]}
                    size="sm"
                    className="transition-colors duration-300 ease-brand group-hover/option:bg-violet-500/20"
                  />
                  <span className="min-w-0 flex-1">
                    <strong className="block font-semibold text-body text-fg">
                      {option.title}
                    </strong>
                    <small className="mt-1 block text-fg-muted text-small">
                      {option.detail}
                    </small>
                  </span>
                  <ArrowRight
                    aria-hidden
                    className="mt-1 size-4 shrink-0 text-fg-subtle transition-[color,translate] duration-500 ease-brand group-hover/option:translate-x-0.5 group-hover/option:text-highlight motion-reduce:transition-none"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </Section>
  );
}
