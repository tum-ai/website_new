/**
 * E-Lab public API for other features: the founder testimonials, quoted on
 * the homepage (the code list, and the server-only getter that reads the
 * CMS content source; import this index only from server modules).
 *
 * The /e-lab route imports `./e-lab-page` directly; never re-export a page
 * here (see features/partners/index.ts).
 */

export { testimonialCards } from "./data/venture-page";
export { getTestimonialCards } from "./venture-content";
