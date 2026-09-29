import {
  Actions,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { contactEmails } from "@/config/contact";

/** A mail to the general inbox, its subject filled in. */
const askUs = `mailto:${contactEmails.general}?subject=${encodeURIComponent("A question about TUM.ai")}`;

/** The two readers' next steps beside the inbox. */
const forks = [
  {
    reader: "For students",
    text: "Membership starts with a recruiting round. The apply page has the dates and the steps.",
    label: "Become a Member",
    href: "/apply",
  },
  {
    reader: "For companies",
    text: "Partners meet our members through talent packages, hackathon challenges and company visits.",
    label: "Become a Partner",
    href: "/partners",
  },
] as const;

/**
 * The page's close on ink. The page opens with the answers marked in the
 * mission; it ends on the questions the paragraph leaves open, handed to the
 * people who can answer them, with each reader's next step beside it.
 */
export function ClosingSection() {
  return (
    <Section tone="ink" spacing="xl" aria-labelledby="qanda-close-title">
      <Container>
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            <Reveal>
              <h2
                id="qanda-close-title"
                className="max-w-[11em] text-display-xl text-highlight"
              >
                Not in the paragraph? Ask us.
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
                Write to us with anything this page leaves open.
              </p>
              <Actions className="mt-10 md:mt-12">
                <ButtonLink href={askUs} size="lg" arrow>
                  Ask your question
                </ButtonLink>
              </Actions>
            </Reveal>
          </div>
          <ul className="grid gap-10 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1 lg:self-end">
            {forks.map((fork, index) => (
              <Reveal
                as="li"
                key={fork.reader}
                delay={160 + index * 80}
                className="border-hairline-strong border-t pt-8"
              >
                <p className="font-medium text-fg text-small">{fork.reader}</p>
                <p className="mt-3 text-body text-fg-muted">{fork.text}</p>
                <p className="mt-5">
                  <TextLink href={fork.href} arrow className="text-small">
                    {fork.label}
                  </TextLink>
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
