import "server-only";

/**
 * E-Lab server API for other features: the founder testimonials, quoted on
 * the homepage, from the CMS content source (or the code list). Import it
 * only from server modules.
 *
 * The /e-lab route imports `./e-lab-page` directly; never re-export a page
 * here (see features/partners/index.ts).
 */

export { buildVentureBackfill, getTestimonialCards } from "./venture-content";
