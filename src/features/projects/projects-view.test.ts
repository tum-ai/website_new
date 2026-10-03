import { expect, test } from "vitest";
import { spellCountCapitalized } from "@/lib/words";
import { projectsCopyTemplate } from "./data/copy";
import { openSeatSlug, taskForces } from "./data/projects";
import { projectsView } from "./projects-view";

test("the hero counts the task forces and the figure ends on the open seat", () => {
  const { hero, figureSeats } = projectsView(projectsCopyTemplate, taskForces);
  expect(hero.lead).toContain(
    `${spellCountCapitalized(taskForces.length)} run today`,
  );
  expect(figureSeats.map(({ slug }) => slug)).toStrictEqual([
    ...taskForces.map(({ slug }) => slug),
    openSeatSlug,
  ]);
  expect(figureSeats.at(-1)).toMatchObject({
    ...projectsCopyTemplate.openSeat,
    open: true,
  });
});

test("the partners' text names the first partner, or does without one", () => {
  const partner = taskForces.find((taskForce) => taskForce.work)?.work?.partner;
  expect(partner).toBeDefined();
  expect(
    projectsView(projectsCopyTemplate, taskForces).closing.partner.text,
  ).toContain(`such as ${partner}.`);
  const withoutWork = taskForces.map(({ work: _, ...taskForce }) => taskForce);
  expect(
    projectsView(projectsCopyTemplate, withoutWork).closing.partner.text,
  ).toBe(projectsCopyTemplate.closing.partner.textWithoutPartner);
});
