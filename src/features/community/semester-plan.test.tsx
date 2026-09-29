import { axe } from "@test/axe";
import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { journeySteps, stepAnchor } from "./data/member-journey";
import { stories } from "./data/member-stories";
import { SemesterPlan } from "./semester-plan";

/** Reveal needs matchMedia and an IntersectionObserver; nothing intersects. */
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
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("SemesterPlan", () => {
  test("lists every journey step in order under the section heading", async () => {
    const { container } = render(<SemesterPlan />);
    expect(
      screen.getByRole("region", { name: "Semester by semester" }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent),
    ).toStrictEqual(journeySteps.map((step) => step.name));
    expect(await axe(container)).toHaveNoViolations();
  });

  test("keeps each step's anchor for deep links", () => {
    render(<SemesterPlan />);
    for (const step of journeySteps) {
      const heading = screen.getByRole("heading", { name: step.name });
      expect(heading.closest(`#${stepAnchor(step.step)}`)).not.toBeNull();
    }
  });

  test("says in words when each step opens, since the columns are decorative", () => {
    render(<SemesterPlan />);
    for (const step of journeySteps) {
      const row = document.getElementById(stepAnchor(step.step));
      expect(row).toHaveTextContent(
        step.fromSemester === 0
          ? "Once, at the start"
          : `From semester ${step.fromSemester}`,
      );
    }
  });

  test("quotes the members named as evidence, with their names", () => {
    render(<SemesterPlan />);
    for (const step of journeySteps) {
      if (!step.evidence) continue;
      const row = document.getElementById(stepAnchor(step.step));
      const story = stories.find((entry) => entry.name === step.evidence?.name);
      expect(row).toHaveTextContent(step.evidence.excerpt);
      expect(row).toHaveTextContent(`${story?.name}, ${story?.role}`);
    }
  });
});
