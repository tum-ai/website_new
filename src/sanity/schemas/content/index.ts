import { applicationWindowType } from "./application-window";
import { campaignType } from "./campaign";
import { caseStudyType } from "./case-study";
import { faqType } from "./faq";
import { logoListType } from "./logo-list";
import { organizationType } from "./organization";
import { partnersCopyType } from "./partners-copy";
import { personType } from "./person";
import { siteSettingsType } from "./site-settings";
import { ventureTraceType } from "./venture-trace";

/**
 * The document types of the `content` workspace (the content dataset; see
 * src/sanity/sanity.config.ts). Register a new content type here; it must
 * never go into the live workspace, whose dataset the old site renders.
 */
export const contentSchemaTypes = [
  // Shared page content
  faqType,
  // Phases 1 and 2: campaigns, application windows, site settings
  siteSettingsType,
  applicationWindowType,
  campaignType,

  // Phase 3: organizations (logos) and people
  organizationType,
  logoListType,
  personType,
  caseStudyType,
  ventureTraceType,
  partnersCopyType,
  // Phase 4: page copy
];

/**
 * Singleton types: exactly one document each, with the type name as its
 * `_id`. The Studio pins them at the top of the content structure and hides
 * "create" and "duplicate" for them. Add `{ type, title }` when a singleton
 * type (for example `siteSettings`) joins `contentSchemaTypes`.
 */
export const contentSingletons: readonly { type: string; title: string }[] = [
  // Phases 1 and 2
  { type: "siteSettings", title: "Site settings" },
  // Phase 3: organizations (logos) and people
  { type: "partnersCopy", title: "Partners page copy" },
  { type: "ventureTrace", title: "E-Lab traced venture" },
];
