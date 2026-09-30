import {
  Actions,
  ButtonLink,
  Container,
  Reveal,
  Section,
  TextLink,
} from "@/components/ds";
import { callToActionLabels } from "@/config/calls-to-action";
import type { QandaCopy } from "./data/qanda";

/** A mail to `email` (the general inbox), its subject filled in. */
const askUs = (email: string) =>
  `mailto:${email}?subject=${encodeURIComponent("A question about TUM.ai")}`;

/**
 * The page's close on ink. The page opens with the answers marked in the
 * mission; it ends on the questions the paragraph leaves open, handed to the
 * people who can answer them, with each reader's next step beside it. The
 * companies' step is the partner pitch (`partnerPitch`, from the partners
 * copy); `email` is the general inbox from the site facts.
 */
export function ClosingSection({
  closing,
  forks: readers,
  partnerPitch,
  email,
}: Pick<QandaCopy, "closing" | "forks"> & {
  partnerPitch: string;
  email: string;
}) {
  const forks = [
    {
      reader: readers.students.reader,
      text: readers.students.text,
      label: callToActionLabels.member,
      href: "/apply",
    },
    {
      reader: readers.companies.reader,
      text: partnerPitch,
      label: callToActionLabels.partner,
      href: "/partners",
    },
  ];
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
                {closing.title}
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="mt-8 max-w-xl text-fg-muted text-lead md:mt-10">
                {closing.lead}
              </p>
              <Actions className="mt-10 md:mt-12">
                <ButtonLink href={askUs(email)} size="lg" arrow>
                  {closing.action}
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
