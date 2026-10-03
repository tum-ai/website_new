import "server-only";

import { defineQuery } from "next-sanity";
import { loadContent } from "./cms-content";
import {
  contentArray,
  contentObject,
  contentString,
  parseContent,
} from "./cms-content-model";
import { fillCmsCopy } from "./content-copy";
import type { ContentTokens } from "./content-tokens";
import type { FAQ_QUERY_RESULT, Faq } from "./sanity.types.generated";

/** FAQ collection identifiers stored in the CMS. */
export type FaqCollection = Faq["collection"];
/** Validated FAQ entry as a page renders it. */
export type FaqEntry = { question: string; answer: string };

const FAQ_QUERY = defineQuery(
  `*[_type == "faq" && collection == $collection] | order(order asc){ question, answer }`,
);
const faqParser = contentArray(
  contentObject({ question: contentString, answer: contentString }),
);

/** Published questions in editorial order. A deliberately empty collection remains empty. */
export function getFaqs(
  collection: FaqCollection,
  { tokens }: { tokens: ContentTokens },
): Promise<FaqEntry[]> {
  const label = `the ${collection} FAQ`;
  return loadContent<FaqEntry[], FAQ_QUERY_RESULT>({
    query: FAQ_QUERY,
    params: { collection },
    tags: ["content:faq"],
    label,
    select: (result) =>
      parseContent(fillCmsCopy(result, tokens, label), faqParser, label),
  });
}
