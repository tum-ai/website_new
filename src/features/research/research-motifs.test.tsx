import { render } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { isResearchMotif, researchMotifKeys } from "./data/research-motifs";
import { ResearchMotifArt } from "./research-motifs";

describe("isResearchMotif", () => {
  test("accepts the Studio's keys only", () => {
    for (const key of researchMotifKeys)
      expect(isResearchMotif(key)).toBe(true);
    for (const value of ["", "Phase-Diagram", "toString", null, undefined, 3]) {
      expect(isResearchMotif(value)).toBe(false);
    }
  });
});

describe("ResearchMotifArt", () => {
  test.each(researchMotifKeys)("%s is a decorative line drawing", (motif) => {
    const { container } = render(<ResearchMotifArt motif={motif} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("data-motif", motif);
    expect(svg?.textContent).toBe("");
    // Structure and one accent layer.
    expect(svg?.querySelector(".text-highlight")).not.toBeNull();
    expect(
      svg?.querySelectorAll("line, path, circle, ellipse, polygon, rect")
        .length,
    ).toBeGreaterThan(8);
  });

  test("every motif draws something different, the same way on every render", () => {
    const markup = (motif: (typeof researchMotifKeys)[number]) =>
      render(<ResearchMotifArt motif={motif} />).container.innerHTML;
    const drawings = researchMotifKeys.map(markup);
    expect(new Set(drawings).size).toBe(researchMotifKeys.length);
    expect(researchMotifKeys.map(markup)).toEqual(drawings);
  });
});
