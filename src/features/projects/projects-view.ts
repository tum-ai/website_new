import { fillPageTokens } from "@/lib/content-copy";
import { spellCountCapitalized } from "@/lib/words";
import type { ProjectsCopy } from "./data/copy";
import { openSeatSlug, type TaskForce } from "./data/projects";

/** One circle of the figure: a task force, or the open seat. */
type FigureSeat = {
  slug: string;
  name: string;
  field: string;
  open?: boolean;
};

/**
 * What the page renders from its copy and task forces: the page tokens
 * filled, and the figure's seats (the task forces clockwise from the top,
 * then the open one).
 */
export function projectsView(
  copy: ProjectsCopy,
  taskForces: readonly TaskForce[],
) {
  const partner = taskForces.find((taskForce) => taskForce.work)?.work?.partner;
  const count = spellCountCapitalized(taskForces.length);
  return {
    hero: { ...copy.hero, lead: fillPageTokens(copy.hero.lead, { count }) },
    figureSeats: [
      ...taskForces.map(({ slug, name, field }) => ({ slug, name, field })),
      { slug: openSeatSlug, ...copy.openSeat, open: true },
    ] satisfies FigureSeat[],
    closing: {
      title: copy.closing.title,
      lead: copy.closing.lead,
      student: copy.closing.student,
      partner: {
        audience: copy.closing.partner.audience,
        text: partner
          ? fillPageTokens(copy.closing.partner.text, { partner })
          : copy.closing.partner.textWithoutPartner,
      },
    },
  };
}
