import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { getJourneyStages } from "@/features/community/server";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { loadContent } from "@/lib/cms-content";
import { fillCmsCopy, fillCodeCopy } from "@/lib/content-copy";
import { buildFaqBackfill } from "@/lib/faq-content";
import { anchorIdPattern, reservedQandaIds } from "@/lib/page-anchors";
import { spanProblems } from "@/lib/passage-spans";
import type { QANDA_CONTENT_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { getSafeSitePath, isHttpsUrl } from "@/lib/security";
import {
  faqTemplates,
  type QandaCopy,
  type QandaEntry,
  qandaCopyTemplate,
} from "./data/qanda";
import { withJourneyTracks } from "./journey-tracks";

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

/** A link the evidence may render: a path on this site or an https URL. */
const isEvidenceHref = (href: string) =>
  getSafeSitePath(href) !== null || isHttpsUrl(href);

/**
 * CMS entries shaped like the code list. Dropped (and logged): incomplete
 * entries, and entries whose anchor id is malformed, taken by the layout or
 * the page (`reservedQandaIds`) or used by an earlier entry, because the id
 * is the element's `id` and the page's links point at it. Evidence renders
 * only with a label and a link that stays on the site or is https.
 * Exported for tests.
 */
export function selectFaqs(
  faqs: QANDA_CONTENT_QUERY_RESULT["faqs"],
  tokens: Awaited<ReturnType<typeof getContentTokens>>,
): QandaEntry[] {
  const filled = fillCmsCopy(faqs, tokens, "the Q&A entries");
  const seen = new Set<string>();
  return (Array.isArray(filled) ? filled : []).flatMap((entry) => {
    if (!isEntry(entry)) return [];
    if (
      !anchorIdPattern.test(entry.id) ||
      reservedQandaIds.includes(entry.id) ||
      seen.has(entry.id)
    ) {
      console.warn(
        `[cms-content] Skipping the Q&A entry "${entry.question}": its anchor id "${entry.id}" is malformed, reserved or already used.`,
      );
      return [];
    }
    seen.add(entry.id);
    const { evidence, ...rest } = entry;
    return [
      evidence?.label && evidence.href && isEvidenceHref(evidence.href)
        ? entry
        : rest,
    ];
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
 * Spans are guaranteed to mark the passage. The member-journey answer lists
 * the journey's tracks as the same source renders them on /community
 * (`withJourneyTracks`), so the entry itself holds only its opening.
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
  // After the Q&A read, not beside it: tests that mock the CMS module see
  // only the first of concurrent imports (docs/testing.md).
  const journey = await getJourneyStages(tokens);
  const marked = withMarkableSpans(content);
  return { ...marked, faqs: withJourneyTracks(marked.faqs, journey) };
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
