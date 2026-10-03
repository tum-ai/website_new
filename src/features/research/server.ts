import "server-only";

/**
 * Research server API for other features: the Research Exchange (REX)
 * institutions, which the homepage names, from the CMS content source (or
 * the code list). Import it only from server modules.
 *
 * The /research route imports `./research-page` directly; never re-export a
 * page here (see features/partners/index.ts).
 */

export { getRexInstitutions } from "./rex-content";
