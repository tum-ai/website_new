import "server-only";

import { defineQuery } from "next-sanity";
import { type BackfillDocument, backfillId } from "./cms-backfill";
import { loadContent } from "./cms-content";
import {
  type ContentTokens,
  fillCodeTemplate,
  fillTemplate,
} from "./content-tokens";
import type { FAQ_QUERY_RESULT, Faq } from "./sanity.types.generated";

/**
 * The `faq` content type, shared by the pages that show an FAQ (/apply,
 * /e-lab, later /qanda). Each page keeps its own questions in its feature's
 * `data/faq.ts` and its slice in `features/<x>/content.ts`; this module is
 * the part they share, so it lives in `lib` and takes the page's code list
 * and the placeholder values as arguments.
 */

/** A page's FAQ in the CMS: `apply`, `e-lab` or `qanda`. */
export type FaqCollection = Faq["collection"];

/**
 * One entry as code writes it: the answer may hold `{{name}}` placeholders
 * (`lib/content-tokens.ts`), exactly as the CMS stores it.
 */
export type FaqTemplate = {
  question: string;
  answer: string;
  /**
   * The entry's key: its backfill `_id` is `faq-<collection>-<id>`, so it
   * never follows the question's wording (a reworded question in code must
   * not become a second document). On /qanda it is also the anchor id.
   */
  id: string;
};

/** One entry as the page renders it: placeholders filled. */
export type FaqEntry = { question: string; answer: string };

export const FAQ_QUERY =
  defineQuery(`*[_type == "faq" && collection == $collection] | order(order asc){
  question,
  answer
}`);

type FaqSource = {
  /** The page's code list, the fallback and the backfill source. */
  templates: readonly FaqTemplate[];
  /** The placeholder values for this render, from `getContentTokens()` in `config/content-tokens.ts`. */
  tokens: ContentTokens;
};

/** The documents that recreate a page's code FAQ in the CMS, in order. */
export function buildFaqBackfill(
  collection: FaqCollection,
  templates: readonly FaqTemplate[],
): BackfillDocument[] {
  return templates.map((entry, index) => ({
    _id: backfillId("faq", collection, entry.id),
    _type: "faq",
    collection,
    order: (index + 1) * 10,
    question: entry.question,
    answer: entry.answer,
  }));
}

/**
 * A page's FAQ: the CMS entries of `collection` in their `order` when the
 * source is `sanity` and the collection has any, otherwise the code list.
 * An entry with an unknown placeholder is dropped (and logged) rather than
 * shown with raw braces; the Studio flags it too.
 */
export function getFaqs(
  collection: FaqCollection,
  { templates, tokens }: FaqSource,
): Promise<FaqEntry[]> {
  return loadContent<FaqEntry[], FAQ_QUERY_RESULT>({
    fallback: templates.map(({ question, answer }) => ({
      question,
      answer: fillCodeTemplate(answer, tokens),
    })),
    query: FAQ_QUERY,
    params: { collection },
    tags: ["content:faq"],
    label: `the ${collection} FAQ`,
    mockDocuments: () => buildFaqBackfill(collection, templates),
    select: (result) =>
      result.flatMap(({ question, answer }) => {
        const filled = fillTemplate(answer ?? "", tokens);
        if (filled === null) {
          console.warn(
            `[cms-content] Skipping the ${collection} FAQ "${question}": unknown placeholder in its answer.`,
          );
        }
        return question && filled ? [{ question, answer: filled }] : [];
      }),
  });
}
