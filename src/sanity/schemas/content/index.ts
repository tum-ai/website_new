import { faqType } from "./faq";

/**
 * The document types of the `content` workspace (the content dataset; see
 * src/sanity/sanity.config.ts). Register a new content type here; it must
 * never go into the live workspace, whose dataset the old site renders.
 */
export const contentSchemaTypes = [faqType];

/**
 * Singleton types: exactly one document each, with the type name as its
 * `_id`. The Studio pins them at the top of the content structure and hides
 * "create" and "duplicate" for them. Add `{ type, title }` when a singleton
 * type (for example `siteSettings`) joins `contentSchemaTypes`.
 */
export const contentSingletons: readonly { type: string; title: string }[] = [];
