import { applicationWindowType } from "./application-window";
import { applyCopyType } from "./apply-copy";
import { campaignType } from "./campaign";
import { caseStudyType } from "./case-study";
import { communityCopyType } from "./community-copy";
import { departmentType } from "./department";
import { eLabCopyType } from "./e-lab-copy";
import { eventsCopyType } from "./events-copy";
import { faqType } from "./faq";
import { homeCopyType } from "./home-copy";
import { journeyStepType } from "./journey-step";
import { labSiteType } from "./lab-site";
import { logoListType } from "./logo-list";
import { milestoneType } from "./milestone";
import { organizationType } from "./organization";
import { partnersCopyType } from "./partners-copy";
import { personType } from "./person";
import { projectsCopyType } from "./projects-copy";
import { qandaCopyType } from "./qanda-copy";
import { researchCopyType } from "./research-copy";
import { siteSettingsType } from "./site-settings";
import { taskForceType } from "./task-force";
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
  qandaCopyType,
  communityCopyType,
  journeyStepType,
  departmentType,
  projectsCopyType,
  taskForceType,
  researchCopyType,
  labSiteType,
  homeCopyType,
  applyCopyType,
  milestoneType,
  eLabCopyType,
  eventsCopyType,
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
  // Phase 4: page copy
  { type: "qandaCopy", title: "Q&A page" },
  { type: "communityCopy", title: "Community page" },
  { type: "projectsCopy", title: "Projects page" },
  { type: "researchCopy", title: "Research page" },
  { type: "homeCopy", title: "Homepage" },
  { type: "applyCopy", title: "Apply page" },
  { type: "eLabCopy", title: "E-Lab page" },
  { type: "eventsCopy", title: "Events page" },
];
