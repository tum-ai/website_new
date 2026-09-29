import "server-only";

import { getContentTokens } from "@/config/content-tokens";
import type { BackfillDocument } from "@/lib/cms-backfill";
import { buildFaqBackfill, type FaqEntry, getFaqs } from "@/lib/faq-content";
import { faqTemplates } from "./data/faq";

/**
 * The /apply content slice: what the page reads through the CMS content
 * source (`lib/cms-content.ts`). The code fallback is `data/faq.ts`.
 */

/** The /apply FAQ: the CMS `apply` collection, or the code list. */
export async function getApplyFaqs(): Promise<FaqEntry[]> {
  return getFaqs("apply", {
    templates: faqTemplates,
    tokens: await getContentTokens(),
  });
}

/** The /apply FAQ as documents for `pnpm sanity:backfill`. */
export function buildApplyBackfill(): BackfillDocument[] {
  return buildFaqBackfill("apply", faqTemplates);
}
