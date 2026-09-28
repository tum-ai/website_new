import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { PageHero } from "./page-hero";
import { stubMatchMedia, stubObservers } from "./testing";

beforeEach(() => {
  stubMatchMedia({ reducedMotion: true });
  stubObservers();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** The aurora's drifting glows and the grain overlay, as rendered. */
function decoration(container: HTMLElement) {
  return {
    aurora: container.querySelectorAll('[class*="animate-aurora"]').length,
    grain: container.querySelectorAll(".grain").length,
  };
}

describe("PageHero", () => {
  test("is the page's h1 and labels its band", async () => {
    const { container } = render(
      <main>
        <PageHero
          titleId="hero-title"
          title="Research"
          splitTitle={false}
          lead="Projects with labs."
        />
      </main>,
    );
    const heading = screen.getByRole("heading", { level: 1, name: "Research" });
    expect(heading).toHaveAttribute("id", "hero-title");
    expect(
      screen.getByRole("region", { name: "Research" }),
    ).toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  test("shows the aurora and grain by default", () => {
    const { container } = render(<PageHero title="Events" />);
    expect(decoration(container).aurora).toBeGreaterThan(0);
    expect(decoration(container).grain).toBe(1);
  });

  test("a quiet backdrop leaves the flat band", () => {
    const { container } = render(
      <PageHero title="Research" backdrop="quiet" mark={false}>
        <p>Affiliations</p>
      </PageHero>,
    );
    expect(decoration(container)).toEqual({ aurora: 0, grain: 0 });
    expect(screen.getByText("Affiliations")).toBeInTheDocument();
  });
});
