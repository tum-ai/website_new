/**
 * Q&A public API for other features: the FAQ entries, which the design-system
 * showcase renders.
 *
 * The /qanda route imports `./qanda-page` directly; never re-export a page
 * here (see features/partners/index.ts).
 */

export { faqs } from "./data/qanda";
