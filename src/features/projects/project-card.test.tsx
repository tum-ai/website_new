import { axe } from "@test/axe";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";
import type { Project } from "./data/projects";
import { ProjectCard } from "./project-card";

const project: Project = {
  name: "quanTUM.ai",
  description: "Machine learning for quantum science.",
  detailedDescription: "Research projects, sessions and hackathons.",
};

test("the tile opens the task force details and returns focus", async () => {
  const user = userEvent.setup();
  const { container } = render(
    <div id="app-root">
      <ProjectCard project={project} index={2} />
    </div>,
  );
  const trigger = screen.getByRole("button", { name: project.name });
  expect(container.querySelector("img")).toBeNull();
  expect(await axe(container)).toHaveNoViolations();

  await user.click(trigger);
  const dialog = await screen.findByRole("dialog", { name: project.name });
  expect(dialog).toHaveAccessibleDescription(project.description);
  expect(within(dialog).getByText("Task force 03")).toBeInTheDocument();
  expect(
    within(dialog).getByText(project.detailedDescription),
  ).toBeInTheDocument();
  expect(await axe(dialog)).toHaveNoViolations();

  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
});
