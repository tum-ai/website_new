import { PageHero } from "@/components/ds";
import { ClosingSection } from "./closing-section";
import {
  brandMission,
  faqs,
  missionPassage,
  missionQuestion,
} from "./data/qanda";
import { MissionSection } from "./mission-section";

/**
 * The page's questions as schema.org `Question` nodes, for the FAQPage
 * JSON-LD the route renders. Answers are the visible text, facts included.
 */
export const qandaMainEntity = [
  { question: missionQuestion, answer: missionPassage },
  ...faqs.map((faq) => ({
    question: faq.question,
    answer: [faq.answer, ...(faq.points ?? [])].join(" "),
  })),
].map(({ question, answer }) => ({
  "@type": "Question",
  name: question,
  acceptedAnswer: { "@type": "Answer", text: answer },
}));

/**
 * /qanda, for anyone with a question about TUM.ai. It opens on the brand
 * guide's short mission; the long one follows as a context passage in which
 * the answer to each question is marked (the page's one bold element), and
 * the close hands whatever the paragraph leaves open to the inbox and each
 * reader's next step.
 */
export function QandAPage() {
  return (
    <main>
      <PageHero
        titleId="qanda-hero-title"
        tone="night"
        mark={false}
        emphasis="highlight"
        title="Questions and answers."
        lead={brandMission}
      />
      <MissionSection />
      <ClosingSection />
    </main>
  );
}
