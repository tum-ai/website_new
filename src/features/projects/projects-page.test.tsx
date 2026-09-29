import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { projectsCopyTemplate } from "./data/copy";
import { openSeatSlug, taskForces } from "./data/projects";
import { ProjectsPage } from "./projects-page";

/*
 * Reduced motion keeps every Reveal in its idle, visible state, so jsdom
 * needs no IntersectionObserver.
 */
beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

test("the page has one h1 and passes axe", async () => {
  const { container } = render(await ProjectsPage());
  expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(await axe(container)).toHaveNoViolations();
});

test("every circle in the hero links to a place on the page, clockwise with the open one last", async () => {
  const { container } = render(await ProjectsPage());
  const index = screen.getByRole("list", {
    name: projectsCopyTemplate.hero.figureLabel,
  });
  const links = within(index).getAllByRole("link");
  expect(links.map((link) => link.getAttribute("href"))).toEqual([
    ...taskForces.map((taskForce) => `#${taskForce.slug}`),
    `#${openSeatSlug}`,
  ]);
  for (const link of links) {
    const target = link.getAttribute("href")?.slice(1) ?? "";
    expect(container.querySelector(`[id="${target}"]`)).not.toBeNull();
  }
});

test("each task force has a chapter headed by its name, in the figure's order", async () => {
  render(await ProjectsPage());
  const chapters = screen.getAllByRole("article");
  expect(chapters.map((chapter) => chapter.id)).toEqual(
    taskForces.map((taskForce) => taskForce.slug),
  );
  taskForces.forEach((taskForce, i) => {
    const chapter = chapters[i] as HTMLElement;
    expect(
      within(chapter).getByRole("heading", { level: 2, name: taskForce.name }),
    ).toBeInTheDocument();
    expect(within(chapter).getByText(taskForce.field)).toBeInTheDocument();
    for (const item of taskForce.work?.items ?? []) {
      expect(within(chapter).getByText(item)).toBeInTheDocument();
    }
  });
});

test("the close offers both audiences a way in", async () => {
  render(await ProjectsPage());
  const close = screen.getByRole("region", { name: /open circle/i });
  expect(
    within(close).getByRole("link", { name: /Become a Member/ }),
  ).toHaveAttribute("href", "/apply");
  expect(
    within(close).getByRole("link", { name: /Become a Partner/ }),
  ).toHaveAttribute("href", "/partners#partner-contact");
});
