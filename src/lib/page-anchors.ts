/**
 * Element ids the /qanda page renders besides its questions, so a CMS
 * anchor id (`faq.anchor`, the question's `id` on /qanda) can never collide
 * with one: the site layout's (`app/(site)/layout.tsx`: `app-root`,
 * `main-content`, the skip link's target) and the page's own sections
 * (`features/qanda`). Isomorphic: the /qanda slice drops an entry with one
 * of these, and the Studio refuses it. Add an id here when the layout or
 * /qanda gains one.
 */
export const reservedQandaIds: readonly string[] = [
  "app-root",
  "main-content",
  "qanda-hero-title",
  "mission",
  "mission-title",
  "mission-passage",
  "qanda-close-title",
];

/** A usable anchor id: lowercase letters, digits and hyphens. */
export const anchorIdPattern = /^[a-z0-9-]+$/;
