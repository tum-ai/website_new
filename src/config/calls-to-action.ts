/**
 * The labels of the site's standing calls to action, wherever they appear:
 * the header, the page heroes, the closing bands and the footer. They name
 * a destination, like the menu labels, so they stay in code and have one
 * owner here, and every page says the same thing. A campaign can relabel the
 * header's CTA for its run (`config/campaigns.ts`); page copy in the CMS
 * never repeats them.
 */
export const callToActionLabels = {
  /** To /apply. */
  member: "Become a Member",
  /** To /partners. */
  partner: "Become a Partner",
  /** The application form, while a window is open. */
  apply: "Apply now",
  /** To /qanda. */
  questions: "Questions and answers",
} as const;
