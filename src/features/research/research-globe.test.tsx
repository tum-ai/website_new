import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getLabSites } from "./research";
import { ResearchGlobe } from "./research-globe";

// jsdom has no WebGL: cobe fails to start, so the globe stays hidden while
// the slider semantics and keyboard turning still work.
vi.mock("cobe", () => ({
  default: () => {
    throw new Error("no WebGL");
  },
}));

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});

const { sites } = getLabSites(["MIT", "IBM Almaden", "Inria"]);

describe("ResearchGlobe", () => {
  test("is a named slider that says which places it shows", async () => {
    const { container } = render(<ResearchGlobe sites={sites} />);
    const globe = screen.getByRole("slider", {
      name: "Globe of our research sites",
    });
    expect(globe).toHaveAccessibleDescription(
      /Arcs run from Munich to Boston \(MIT\); San Jose \(IBM Almaden\); Paris \(Inria\)/,
    );
    expect(globe).toHaveAttribute("aria-valuetext", "Centred on 28° west");
    expect(await axe(container)).toHaveNoViolations();
  });

  test("the arrow keys turn it and announce the new centre", async () => {
    const user = userEvent.setup();
    render(<ResearchGlobe sites={sites} />);
    const globe = screen.getByRole("slider");
    const before = Number(globe.getAttribute("aria-valuenow"));
    globe.focus();
    await user.keyboard("{ArrowRight}");
    // A right turn brings places to the east into view.
    expect(Number(globe.getAttribute("aria-valuenow"))).toBeGreaterThan(before);
  });

  test("the zoom buttons wait for the globe to render", () => {
    render(<ResearchGlobe sites={sites} />);
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Zoom out" })).toBeDisabled();
  });
});
