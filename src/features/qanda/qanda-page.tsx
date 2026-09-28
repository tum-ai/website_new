import {
  ButtonLink,
  Container,
  CtaBand,
  type FaqItem,
  FaqSection,
  Highlight,
  PageHero,
  Reveal,
  Section,
  SectionHeader,
} from "@/components/ds";
import { contactEmails } from "@/config/contact";
import { faqs } from "./data/qanda";

/**
 * The homepage's "More on our Mission" link lands here, so the mission answer
 * opens the page as an editorial statement; every other question stays in the
 * FAQ. Falls back to a plain FAQ if the entry is ever renamed.
 */
const MISSION_QUESTION = "What is TUM.ai's Mission?";
const mission = faqs.find((faq) => faq.question === MISSION_QUESTION);

/** Collapses the indentation of multi-line template-literal answers. */
function answerLines(answer: string) {
  return answer
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/** Splits a paragraph into sentences for the editorial mission layout. */
function sentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=\.)\s+(?=[A-Z])/);
}

/**
 * One answer. A multi-line answer ("Members can join one of two tracks:")
 * introduces its remaining lines as a list.
 */
function Answer({ text }: { text: string }) {
  const [first, ...rest] = answerLines(text);
  if (rest.length === 0) return <p>{first}</p>;
  return (
    <>
      <p>{first}</p>
      <ul className="mt-5 space-y-3">
        {rest.map((line) => (
          <li
            key={line}
            className="relative rounded-2xl bg-raised py-4 pr-5 pl-9 ring-1 ring-hairline ring-inset before:absolute before:top-[1.6rem] before:left-4 before:size-1.5 before:rounded-full before:bg-highlight"
          >
            {line}
          </li>
        ))}
      </ul>
    </>
  );
}

const questions: FaqItem[] = faqs
  .filter((faq) => faq !== mission)
  .map((faq) => ({
    question: faq.question,
    answer: <Answer text={faq.answer} />,
  }));

function MissionStatement({ answer }: { answer: string }) {
  const [lead, ...rest] = sentences(answer);
  return (
    <Section
      tone="paper"
      spacing="lg"
      id="mission"
      aria-labelledby="mission-title"
    >
      <Container className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <SectionHeader
          id="mission-title"
          eyebrow="Mission"
          title={MISSION_QUESTION}
          layout="stack"
          className="mb-0 md:mb-0 lg:col-span-4"
        />
        <div className="lg:col-span-8 lg:pt-10">
          <Reveal delay={120}>
            <p className="font-medium text-fg text-heading-lg">{lead}</p>
          </Reveal>
          {rest.length > 0 ? (
            <div className="mt-12 grid gap-8 md:grid-cols-2 md:gap-10">
              {rest.map((sentence, index) => (
                <div key={sentence}>
                  <Reveal
                    variant="line"
                    delay={200 + index * 100}
                    className="h-px bg-hairline-strong"
                  />
                  <Reveal delay={260 + index * 100}>
                    <p className="pt-6 text-fg-muted text-lead">{sentence}</p>
                  </Reveal>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}

export function QandAPage() {
  return (
    <main>
      <PageHero
        size="md"
        title={
          <>
            Frequently Asked <Highlight>Questions</Highlight>
          </>
        }
        lead="Find answers to common questions about TUM.ai."
      />

      {mission ? <MissionStatement answer={mission.answer} /> : null}

      <FaqSection
        tone="lavender"
        title="Questions & answers"
        items={questions}
      />

      <CtaBand
        titleId="qanda-contact-title"
        eyebrow="Contact"
        title="Still have a question?"
        actions={
          <ButtonLink href={`mailto:${contactEmails.general}`} arrow>
            {contactEmails.general}
          </ButtonLink>
        }
      />
    </main>
  );
}
