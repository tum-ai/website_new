import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { Tabs, TabsList, TabsPanel, TabsTab } from "./tabs";
import { stubMatchMedia, stubObservers } from "./testing";

function Example() {
  return (
    <Tabs defaultValue="projects">
      <TabsList aria-label="Research tabs">
        <TabsTab value="projects">Projects</TabsTab>
        <TabsTab value="exchange">Exchange</TabsTab>
        <TabsTab value="papers">Papers</TabsTab>
      </TabsList>
      <TabsPanel value="projects">Project list</TabsPanel>
      <TabsPanel value="exchange">Exchange program</TabsPanel>
      <TabsPanel value="papers">Paper list</TabsPanel>
    </Tabs>
  );
}

beforeEach(() => {
  stubMatchMedia();
  stubObservers();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Tabs", () => {
  test("renders a named tab list with the default tab selected", () => {
    render(<Example />);
    expect(
      screen.getByRole("tablist", { name: "Research tabs" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Projects" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Project list");
  });

  test("moves focus with the arrow keys, wrapping at the ends", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    expect(screen.getByRole("tab", { name: "Projects" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Exchange" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Papers" })).toHaveFocus();
  });

  test("activates a tab with Enter and shows its panel", async () => {
    const user = userEvent.setup();
    render(<Example />);
    await user.tab();
    await user.keyboard("{ArrowRight}{Enter}");
    expect(screen.getByRole("tab", { name: "Exchange" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Exchange program");
  });

  test("has no axe violations", async () => {
    const { container } = render(<Example />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
