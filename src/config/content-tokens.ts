import type { ContentTokens } from "@/lib/content-tokens";
import { contactEmails } from "./contact";
import { eLabApplicationCopy, eLabConfig } from "./e-lab";
import { recruitingTimeline } from "./membership";

/**
 * The values of the `{{name}}` placeholders in editable copy (the names and
 * the mechanism are in `lib/content-tokens.ts`). Each one is a fact from
 * this folder, so a config edit updates the code copy and the CMS copy alike.
 */
export const contentTokens: ContentTokens = {
  "recruiting.application": recruitingTimeline.application,
  "recruiting.interview": recruitingTimeline.interview,
  "recruiting.onboarding": recruitingTimeline.onboarding,
  "contact.recruitmentEmail": contactEmails.recruitment,
  "eLab.programWeeks": String(eLabConfig.programWeeks),
  "eLab.deadline": eLabApplicationCopy.deadlineLabel,
};
