/**
 * E-Lab public API for other features: the application-phase switch and the
 * testimonials, both quoted on the homepage.
 *
 * The /e-lab route imports `./e-lab-page` directly; never re-export a page
 * here (see features/partners/index.ts).
 */

export { testimonialCards } from "./data/venture-page";
export { ELabPhaseSwitch } from "./e-lab-phase-switch";
