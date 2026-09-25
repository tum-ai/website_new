import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
  ButtonLink,
  Container,
  CtaBand,
  Eyebrow,
  Highlight,
  PageHero,
  Reveal,
  Section,
} from "@/components/ds";
import { faqs } from "@/data/qanda";

/**
 * The homepage's "More on our Mission" link lands here, so the mission answer
 * opens the page as an editorial statement; every other question stays in the
 * accordion. Falls back to a plain accordion if the entry is ever renamed.
 */
const MISSION_QUESTION = "What is TUM.ai's Mission?";
const mission = faqs.find((faq) => faq.question === MISSION_QUESTION);
const questions = faqs.filter((faq) => faq !== mission);

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

function Answer({ text }: { text: string }) {
  const [first, ...rest] = answerLines(text);
  if (rest.length === 0) return <p>{first}</p>;
  // "Members can join one of two tracks:" introduces the tracks as a list.
  return (
    <>
      <p>{first}</p>
      <ul className="mt-5 space-y-3">
        {rest.map((line) => (
          <li
            key={line}
            className="relative rounded-2xl bg-raised py-4 pr-5 pl-9 shadow-[inset_0_0_0_1px_var(--tone-hairline)] before:absolute before:top-[1.6rem] before:left-4 before:size-1.5 before:rounded-full before:bg-highlight"
          >
            {line}
          </li>
        ))}
      </ul>
    </>
  );
}

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
        <div className="lg:col-span-4">
          <Reveal>
            <Eyebrow index="01">Mission</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h2 id="mission-title" className="mt-5 text-display-md text-fg">
              {MISSION_QUESTION}
            </h2>
          </Reveal>
        </div>
        <div className="lg:col-span-8 lg:pt-10">
          <Reveal delay={120}>
            <p className="text-heading-lg font-medium text-fg">{lead}</p>
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
                    <p className="pt-6 text-lead text-fg-muted">{sentence}</p>
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

export default function QandA() {
  const faqIndex = mission ? "02" : "01";
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

      <Section
        tone="lavender"
        spacing="lg"
        id="faq"
        aria-labelledby="faq-title"
      >
        <Container className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:col-span-4 lg:self-start">
            <Reveal>
              <Eyebrow index={faqIndex}>FAQ</Eyebrow>
            </Reveal>
            <Reveal delay={60}>
              <h2 id="faq-title" className="mt-5 text-display-md text-fg">
                Questions &amp; answers
              </h2>
            </Reveal>
          </div>
          <Reveal delay={120} className="lg:col-span-8">
            <Accordion defaultValue={[questions[0]?.question]}>
              {questions.map((faq, index) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger>
                    <span className="flex items-baseline gap-4 md:gap-6">
                      <span
                        aria-hidden
                        className="tabular w-6 shrink-0 text-meta font-semibold text-fg-subtle"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{faq.question}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionPanel className="pr-0 pl-10 md:pr-14 md:pl-12">
                    <Answer text={faq.answer} />
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </Container>
      </Section>

      <CtaBand
        titleId="qanda-contact-title"
        eyebrow="Contact"
        title="Still have a question?"
        actions={
          <ButtonLink href="mailto:contact@tum-ai.com" arrow>
            contact@tum-ai.com
          </ButtonLink>
        }
      />
    </main>
  );
}
