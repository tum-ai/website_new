import {
  BulletList,
  Container,
  Section,
  SectionHeader,
  TextLink,
} from "@tum.ai/ui-kit";
import { segmentPassage } from "@/lib/passage-spans";
import type { QandaCopy, QandaEntry } from "./data/qanda";
import { type AnswerItem, MissionAnswers } from "./mission-answers";

/** The answer, its listed points and the fact that shows it. */
function Answer({ faq }: { faq: QandaEntry }) {
  return (
    <>
      {faq.spans?.length ? (
        // Below lg the passage is out of sight, so each answer quotes the
        // words that mark it; from lg the marks show it, and the quote stays
        // for screen readers, which can't see the marks.
        <p className="mb-4 text-fg-subtle text-small lg:sr-only">
          From our mission: “{faq.spans.join(" … ")}”
        </p>
      ) : null}
      <p>{faq.answer}</p>
      {faq.points?.length ? (
        <BulletList items={[...faq.points]} className="mt-5" />
      ) : null}
      {faq.evidence ? (
        <div className="mt-6">
          {faq.evidence.text ? (
            <p className="text-fg text-small">{faq.evidence.text}</p>
          ) : null}
          <p className={faq.evidence.text ? "mt-2" : undefined}>
            <TextLink href={faq.evidence.href} arrow className="text-small">
              {faq.evidence.label}
            </TextLink>
          </p>
        </div>
      ) : null}
    </>
  );
}

/**
 * The page's bold element: the mission paragraph as the context passage,
 * with the words that answer each question marked, beside the questions.
 * Opening a question marks its words in the passage.
 * Server markup for the copy, one island for the shared open state.
 */
export function MissionSection({
  copy,
  faqs,
}: {
  copy: Pick<QandaCopy, "missionQuestion" | "missionLead" | "missionPassage">;
  faqs: readonly QandaEntry[];
}) {
  const segments = segmentPassage(
    copy.missionPassage,
    faqs.flatMap((faq) =>
      (faq.spans ?? []).map((text) => ({ id: faq.id, text })),
    ),
  );
  const items: AnswerItem[] = faqs.map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: <Answer faq={faq} />,
  }));
  return (
    <Section
      tone="paper"
      spacing="lg"
      id="mission"
      aria-labelledby="mission-title"
      className="scroll-mt-header"
    >
      <Container>
        <SectionHeader
          id="mission-title"
          title={copy.missionQuestion}
          size="lg"
          layout="stack"
          lead={copy.missionLead}
        />
        <MissionAnswers
          segments={segments}
          items={items}
          unmarked={faqs
            .filter((faq) => !faq.spans?.length)
            .map(({ id, question }) => ({ id, question }))}
        />
      </Container>
    </Section>
  );
}
