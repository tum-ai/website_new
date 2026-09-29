import "server-only";

import { contentTokens } from "@/config/content-tokens";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { buildFaqBackfill, type FaqEntry, getFaqs } from "@/lib/faq-content";
import { faqTemplates } from "./data/faq";

/**
 * The /e-lab content slice: what the page reads through the CMS content
 * source (`lib/cms-content.ts`). The code fallback is `data/faq.ts`.
 */

/** The /e-lab FAQ: the CMS `e-lab` collection, or the code list. */
export function getELabFaqs(): Promise<FaqEntry[]> {
  return getFaqs("e-lab", { templates: faqTemplates, tokens: contentTokens });
}

/** The /e-lab FAQ as documents for `pnpm sanity:backfill`. */
export function buildELabBackfill(): BackfillDocument[] {
  return buildFaqBackfill("e-lab", faqTemplates);
}
