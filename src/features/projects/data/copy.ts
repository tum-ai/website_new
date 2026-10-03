/**
 * The /projects page's published CMS copy model for the
 * `projectsCopy` singleton (see `../content.ts`). Text may hold `{{name}}`
 * placeholders for site facts, and two page tokens the page fills from the
 * task forces it lists (`projectsPageTokens`).
 */
export type ProjectsCopy = {
  hero: {
    eyebrow: string;
    title: string;
    /** `{{count}}`: the number of task forces, as a capitalized word. */
    lead: string;
    /** The accessible name of the figure's index of circles. */
    figureLabel: string;
  };
  /**
   * Members found task forces: the page keeps one circle open for the next
   * one, and its close invites members to start it (confirmed by the
   * maintainers, 2026-09-29).
   */
  openSeat: { name: string; field: string };
  closing: {
    title: string;
    lead: string;
    student: { audience: string; text: string };
    partner: {
      audience: string;
      /** `{{partner}}`: the partner of the first task force with named work. */
      text: string;
      /** The text when no task force names a partner. */
      textWithoutPartner: string;
    };
  };
};

/** The page tokens of the /projects copy (see `fillPageTokens`). */
export const projectsPageTokens = ["count", "partner"] as const;
