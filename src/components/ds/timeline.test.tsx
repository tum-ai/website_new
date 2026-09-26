import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { stubMatchMedia, stubObservers } from "./testing";
import { Timeline } from "./timeline";

beforeEach(() => {
  stubMatchMedia();
  stubObservers();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const items = [
  { title: "Apply", description: "Tell us about your idea." },
  { title: "Build", description: "Twelve weeks of sprints." },
];

describe("Timeline", () => {
  test("is an ordered list of titled entries", () => {
    render(<Timeline items={items} />);
    const entries = screen.getAllByRole("listitem");
    expect(entries).toHaveLength(2);
    expect(screen.getAllByRole("heading", { level: 3 })[1]).toHaveTextContent(
      "Build",
    );
  });

  test.each(["progress", "dashed"] as const)(
    "%s rail spans the list only, not the continuation",
    (rail) => {
      const { container } = render(
        <Timeline
          items={items}
          rail={rail}
          continuation="Your journey continues..."
        />,
      );
      const track = container.querySelector("[data-timeline-track]");
      const list = screen.getByRole("list");
      const continuation = screen.getByText("Your journey continues...");

      // The full-height rails are positioned against the track, which holds
      // the list; the continuation sits after it with its own fading dash.
      expect(track).toContainElement(list);
      expect(track).not.toContainElement(continuation);
      for (const rail of track?.querySelectorAll(":scope > [aria-hidden]") ??
        []) {
        expect(rail).toHaveClass("top-2", "bottom-2");
      }
      const dash = continuation.parentElement?.querySelector("[aria-hidden]");
      expect(dash).toHaveClass("h-24");
      expect(dash).not.toHaveClass("bottom-2");
    },
  );

  test("number markers are decorative", () => {
    const { container } = render(<Timeline items={items} marker="number" />);
    const marker = container.querySelector("li > [aria-hidden]");
    expect(marker).toHaveTextContent("01");
  });

  test("has no axe violations", async () => {
    const { container } = render(
      <Timeline items={items} alternate continuation="And beyond" />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
