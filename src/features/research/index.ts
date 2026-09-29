/**
 * Research public API for other features: the Research Exchange (REX)
 * institutions, which the homepage names.
 *
 * The /research route imports `./research-page` directly; never re-export a
 * page here (see features/partners/index.ts).
 */

export { rexInstitutions } from "./data/rex";
