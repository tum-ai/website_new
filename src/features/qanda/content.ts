import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import { buildFaqBackfill } from "@/lib/faq-content";
import { spanProblems } from "@/lib/passage-spans";
import type { QANDA_CONTENT_QUERY_RESULT } from "@/lib/sanity.types.generated";
import {
  faqTemplates,
  type QandaCopy,
  type QandaEntry,
  qandaCopyTemplate,
} from "./data/qanda";

/**
 * The /qanda content slice: the `qandaCopy` singleton (hero, mission
 * passage, closing) and the `qanda` FAQ collection with its Q&A-only fields
 * (anchor, points, mission spans, evidence). The code fallback is
 * `data/qanda.ts`.
 */

export const QANDA_CONTENT_QUERY = defineQuery(`{
  "copy": *[_id == "qandaCopy"][0]{
    heroTitle,
    missionQuestion,
    missionLead,
    missionPassage,
    closing{ title, lead, action },
    forks{ students{ reader, text }, companies{ reader } }
  },
  "faqs": *[_type == "faq" && collection == "qanda"] | order(order asc){
    "id": anchor,
    question,
    answer,
    points,
    spans,
    evidence{ text, label, href }
  }
}`);

/** Everything /qanda renders from the slice, placeholders filled. */
export type QandaContent = { copy: QandaCopy; faqs: QandaEntry[] };

const isEntry = (entry: unknown): entry is QandaEntry => {
  const { id, question, answer } = (entry ?? {}) as Partial<QandaEntry>;
  return Boolean(id && question && answer);
};

/** CMS entries shaped like the code list; incomplete ones are dropped. */
function selectFaqs(
  faqs: QANDA_CONTENT_QUERY_RESULT["faqs"],
  tokens: Awaited<ReturnType<typeof getContentTokens>>,
): QandaEntry[] {
  const filled = fillCmsCopy(faqs, tokens, "the Q&A entries");
  return (Array.isArray(filled) ? filled : []).flatMap((entry) => {
    if (!isEntry(entry)) return [];
    const { evidence, ...rest } = entry;
    // An evidence link needs both its label and its target.
    return [evidence?.label && evidence.href ? entry : rest];
  });
}

/**
 * `content` with every span that can't be marked in the passage removed
 * (and logged), so a CMS edit to the passage or an answer never breaks the
 * page: the answer then shows unmarked. The Studio validates the same rule
 * (`spanProblems`), and the tests hold the code copy to it.
 */
function withMarkableSpans(content: QandaContent): QandaContent {
  const spans = content.faqs.flatMap((faq) =>
    (faq.spans ?? []).map((text) => ({ id: faq.id, text })),
  );
  const problems = spanProblems(content.copy.missionPassage, spans);
  if (problems.length === 0) return content;
  for (const { problem } of problems) {
    console.warn(`[cms-content] /qanda leaves a mark out: ${problem}`);
  }
  const broken = new Set(problems.map(({ span }) => `${span.id}:${span.text}`));
  return {
    ...content,
    faqs: content.faqs.map(({ spans: marks, ...faq }) => {
      const kept = (marks ?? []).filter(
        (text) => !broken.has(`${faq.id}:${text}`),
      );
      return kept.length > 0 ? { ...faq, spans: kept } : faq;
    }),
  };
}

/**
 * The /qanda copy and questions: the CMS `qandaCopy` and `qanda` entries
 * over the code copy when the source is `sanity`, otherwise the code copy.
 * Spans are guaranteed to mark the passage.
 */
export async function getQandaContent(): Promise<QandaContent> {
  const tokens = await getContentTokens();
  const content = await loadContent<QandaContent, QANDA_CONTENT_QUERY_RESULT>({
    fallback: {
      copy: fillCodeCopy(qandaCopyTemplate, tokens),
      faqs: fillCodeCopy([...faqTemplates], tokens),
    },
    query: QANDA_CONTENT_QUERY,
    tags: ["content:qandaCopy", "content:faq"],
    label: "the /qanda content",
    mockDocuments: buildQandaBackfill,
    select: ({ copy, faqs }) => ({
      copy: fillCmsCopy(copy, tokens, "the Q&A copy"),
      faqs: selectFaqs(faqs, tokens),
    }),
  });
  return withMarkableSpans(content);
}

/** The /qanda copy and questions as documents for `pnpm sanity:backfill`. */
export function buildQandaBackfill(): BackfillDocument[] {
  const entries = buildFaqBackfill(
    "qanda",
    faqTemplates.map(({ id, question, answer }) => ({ id, question, answer })),
  );
  return [
    { _id: "qandaCopy", _type: "qandaCopy", ...qandaCopyTemplate },
    ...entries.map((document, index) => {
      const { id, points, spans, evidence } = faqTemplates[index];
      return {
        ...document,
        anchor: id,
        ...(points ? { points: [...points] } : {}),
        ...(spans ? { spans: [...spans] } : {}),
        ...(evidence ? { evidence: { ...evidence } } : {}),
      };
    }),
  ];
}
