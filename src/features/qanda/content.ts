import "server-only";

import { defineQuery } from "next-sanity";
import { getContentTokens } from "@/config/content-tokens";
import { getJourneyStages } from "@/features/community/server";
import { loadContent } from "@/lib/cms-content";
import {
  contentArray,
  contentError,
  contentObject,
  contentOptional,
  contentString,
  contentText,
  parseContent,
} from "@/lib/cms-content-model";
import { fillCmsCopy } from "@/lib/content-copy";
import type { ContentTokens } from "@/lib/content-tokens";
import { anchorIdPattern, reservedQandaIds } from "@/lib/page-anchors";
import { spanProblems } from "@/lib/passage-spans";
import type { QANDA_CONTENT_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { getSafeSitePath, isHttpsUrl } from "@/lib/security";
import type { QandaCopy, QandaEntry } from "./data/qanda";
import { withJourneyTracks } from "./journey-tracks";

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

/** Complete Q&A singleton and an optional question collection. */
export type QandaContent = { copy: QandaCopy; faqs: QandaEntry[] };
const copyParser = contentObject({
  heroTitle: contentString,
  missionQuestion: contentString,
  missionLead: contentString,
  missionPassage: contentString,
  closing: contentObject({
    title: contentString,
    lead: contentString,
    action: contentString,
  }),
  forks: contentObject({
    students: contentObject({ reader: contentString, text: contentString }),
    companies: contentObject({ reader: contentString }),
  }),
});
const faqParser = contentArray(
  contentObject({
    id: contentString,
    question: contentString,
    answer: contentString,
    points: contentOptional(contentArray(contentString)),
    spans: contentOptional(contentArray(contentString)),
    evidence: contentOptional(
      contentObject({
        text: contentOptional(contentText),
        label: contentString,
        href: (value, label, path) => {
          const href = contentString(value, label, path);
          if (!getSafeSitePath(href) && !isHttpsUrl(href))
            return contentError(
              label,
              path,
              "requires a safe site path or HTTPS URL",
            );
          return href;
        },
      }),
    ),
  }),
);

/** Every question keeps its CMS identity; malformed anchors fail instead of dropping content. */
export function selectFaqs(faqs: unknown, tokens: ContentTokens): QandaEntry[] {
  const entries = parseContent(
    fillCmsCopy(faqs, tokens, "the Q&A entries"),
    faqParser,
    "the Q&A entries",
  );
  const seen = new Set<string>();
  for (const entry of entries) {
    if (
      !anchorIdPattern.test(entry.id) ||
      reservedQandaIds.includes(entry.id) ||
      seen.has(entry.id)
    )
      contentError(
        "the Q&A entries",
        entry.id,
        "anchor is malformed, reserved or duplicated",
      );
    seen.add(entry.id);
  }
  return entries;
}

/** Spans are an exact published-content contract, including uniqueness and overlap. */
export function validateQandaSpans(content: QandaContent): QandaContent {
  const problems = spanProblems(
    content.copy.missionPassage,
    content.faqs.flatMap((faq) =>
      (faq.spans ?? []).map((text) => ({ id: faq.id, text })),
    ),
  );
  if (problems.length)
    contentError(
      "the /qanda content",
      "faqs.spans",
      problems.map(({ problem }) => problem).join(" "),
    );
  return content;
}

/** Read required page copy and preserve an intentionally cleared FAQ collection. */
export async function getQandaContent(): Promise<QandaContent> {
  const tokens = await getContentTokens();
  const content = await loadContent<QandaContent, QANDA_CONTENT_QUERY_RESULT>({
    query: QANDA_CONTENT_QUERY,
    tags: ["content:qandaCopy", "content:faq"],
    label: "the /qanda content",
    select: ({ copy, faqs }) =>
      validateQandaSpans({
        copy: parseContent(
          fillCmsCopy(copy, tokens, "the Q&A copy"),
          copyParser,
          "the Q&A copy",
        ),
        faqs: selectFaqs(faqs, tokens),
      }),
  });
  const journey = await getJourneyStages(tokens);
  return { ...content, faqs: withJourneyTracks(content.faqs, journey) };
}
