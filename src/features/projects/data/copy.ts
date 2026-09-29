/**
 * The /projects page's own copy as code writes it: the code fallback of the
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

export const projectsCopyTemplate: ProjectsCopy = {
  hero: {
    eyebrow: "Task forces",
    title: "Where AI meets another field.",
    lead: "Task forces are small teams of TUM.ai members who take AI into one other field, through research projects, sessions, hackathons and expeditions. {{count}} run today, and one circle is open for the next.",
    figureLabel: "Jump to a task force",
  },
  openSeat: { name: "Your field", field: "The next task force" },
  closing: {
    title: "The open circle is yours.",
    lead: "Members found task forces. After your first semester, you can lead one, or start the next in the field you bring.",
    student: {
      audience: "For students",
      text: "Join TUM.ai, work in a task force, and bring your own field into it.",
    },
    partner: {
      audience: "For partners",
      text: "Bring a problem from your field. Task forces already work with partners such as {{partner}}.",
      textWithoutPartner:
        "Bring a problem from your field, and a task force can take it on.",
    },
  },
};
