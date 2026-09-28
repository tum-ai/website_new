import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CtaBand, CtaPanel } from "./cta-band";
import { stubMatchMedia, stubObservers } from "./testing";

beforeEach(() => {
  stubMatchMedia({ reducedMotion: true });
  stubObservers();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("CtaPanel", () => {
  test("wraps its content in the ink panel surface", async () => {
    const { container } = render(
      <CtaPanel className="rounded-3xl p-8">
        <p>Build it here.</p>
      </CtaPanel>,
    );
    const panel = screen.getByText("Build it here.").parentElement;
    expect(panel).toHaveAttribute("data-tone", "ink");
    expect(panel).toHaveClass("rounded-3xl");
    expect(panel).not.toHaveClass("rounded-5xl");
    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("CtaBand", () => {
  test("renders the panel variant on the CtaPanel surface", async () => {
    const { container } = render(
      <CtaBand titleId="cta-title" title="Still have a question?" />,
    );
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "Still have a question?",
    });
    expect(heading.closest('[data-tone="ink"]')).not.toBeNull();
    expect(
      screen.getByRole("region", { name: "Still have a question?" }),
    ).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
