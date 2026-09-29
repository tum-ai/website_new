import { PageHero } from "@/components/ds";
import { brandMission } from "@/config/organization";
import { ClosingSection } from "./closing-section";
import { getQandaContent, type QandaContent } from "./content";
import { MissionSection } from "./mission-section";

/**
 * The page's questions as schema.org `Question` nodes, for the FAQPage
 * JSON-LD. Each answer is the visible answer text and its listed points.
 */
function toMainEntity({ copy, faqs }: QandaContent) {
  return [
    { question: copy.missionQuestion, answer: copy.missionPassage },
    ...faqs.map((faq) => ({
      question: faq.question,
      answer: [faq.answer, ...(faq.points ?? [])].join(" "),
    })),
  ].map(({ question, answer }) => ({
    "@type": "Question",
    name: question,
    acceptedAnswer: { "@type": "Answer", text: answer },
  }));
}

/** The FAQPage JSON-LD entities the route renders, from the same content as the page. */
export async function getQandaMainEntity() {
  return toMainEntity(await getQandaContent());
}

/**
 * /qanda, for anyone with a question about TUM.ai. It opens on the brand
 * guide's short mission; the long one follows as a context passage in which
 * the answer to each question is marked (the page's one bold element), and
 * the close hands whatever the paragraph leaves open to the inbox and each
 * reader's next step. The copy and questions come from the content slice
 * (`content.ts`: the CMS or the code copy).
 */
export async function QandAPage() {
  const { copy, faqs } = await getQandaContent();
  return (
    <main>
      <PageHero
        titleId="qanda-hero-title"
        tone="night"
        mark={false}
        emphasis="highlight"
        title={copy.heroTitle}
        lead={brandMission}
      />
      <MissionSection copy={copy} faqs={faqs} />
      <ClosingSection closing={copy.closing} forks={copy.forks} />
    </main>
  );
}
