import "server-only";

/**
 * Q&A server API for other features: the FAQ entries as rendered without the
 * CMS (placeholders filled from the code facts), which the design-system
 * showcase renders. Server-only because filling reads `config/content-tokens`.
 *
 * The /qanda route imports `./qanda-page` directly; never re-export a page
 * here (see features/partners/index.ts).
 */

export { faqs } from "./data/qanda";
