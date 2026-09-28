import { axe } from "@test/axe";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import type { ResearchProject } from "@/lib/types";
import { getResearchProjectLists } from "./research";
import { ResearchCard } from "./research-card";

const [project] = getResearchProjectLists([
  {
    id: "ibm-earth",
    title: "IBM: Foundation Models for Earth Observation",
    description: "Fine-tuning geospatial foundation models for flood mapping.",
    status: "completed",
    publication: "https://arxiv.org/abs/2310.18660",
    keywords: ["Remote Sensing", "Foundation Models"],
  } satisfies ResearchProject,
]).past;

if (!project) throw new Error("fixture must be a completed project");

function renderCard(layout: "card" | "row") {
  const user = userEvent.setup();
  const view = render(
    <div id="app-root">
      <ResearchCard project={project} index={0} layout={layout} />
    </div>,
  );
  const trigger = screen.getByRole("button", { name: project.title });
  return { user, trigger, ...view };
}

describe.each(["card", "row"] as const)("ResearchCard (%s)", (layout) => {
  test("the title names the dialog trigger", async () => {
    const { container, trigger } = renderCard(layout);
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(
      screen.getByRole("heading", { level: 3, name: project.title }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "Keywords" })).getAllByRole(
        "listitem",
      ),
    ).toHaveLength(2);
    expect(await axe(container)).toHaveNoViolations();
  });

  test("opens the details, closes on Escape and returns focus", async () => {
    const { user, trigger } = renderCard(layout);
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", { name: project.title });
    expect(dialog).toHaveAccessibleDescription(project.description);
    expect(within(dialog).getByText("Completed")).toBeInTheDocument();
    expect(
      within(dialog).getByRole("link", { name: /Read Publication/ }),
    ).toHaveAttribute("href", project.publicationUrl);
    expect(await axe(dialog)).toHaveNoViolations();

    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});

test("shows the collaborator on a brand panel when there is no image", () => {
  const { container } = renderCard("card");
  expect(container.querySelector("img")).toBeNull();
  // Once as the eyebrow, once as the (hidden) art on the brand panel.
  expect(screen.getAllByText(project.collaborator)).toHaveLength(2);
});
