import {
  BulletList,
  Container,
  Section,
  SectionHeader,
  TextLink,
} from "@/components/ds";
import { faqs, missionPassage, missionQuestion } from "./data/qanda";
import { type AnswerItem, MissionAnswers } from "./mission-answers";
import { segmentPassage } from "./mission-spans";

const segments = segmentPassage(
  missionPassage,
  faqs.flatMap((faq) =>
    (faq.spans ?? []).map((text) => ({ id: faq.id, text })),
  ),
);

/** The answer, its listed points and the fact that shows it. */
function Answer({ faq }: { faq: (typeof faqs)[number] }) {
  return (
    <>
      {faq.spans ? (
        // Below lg the passage is out of sight, so each answer quotes the
        // words that mark it; from lg the marks show it, and the quote stays
        // for screen readers, which can't see the marks.
        <p className="mb-4 text-fg-subtle text-small lg:sr-only">
          From our mission: “{faq.spans.join(" … ")}”
        </p>
      ) : null}
      <p>{faq.answer}</p>
      {faq.points ? (
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

const items: AnswerItem[] = faqs.map((faq) => ({
  id: faq.id,
  question: faq.question,
  answer: <Answer faq={faq} />,
}));

/**
 * The page's bold element: the mission paragraph as the context passage,
 * with the words that answer each question marked, beside the questions.
 * Opening a question marks its words in the passage.
 * Server markup for the copy, one island for the shared open state.
 */
export function MissionSection() {
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
          title={missionQuestion}
          size="lg"
          layout="stack"
          lead="The short answer is above. The long one covers most of what people ask us: open a question and the words that answer it are marked."
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
