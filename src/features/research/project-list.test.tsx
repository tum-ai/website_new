import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { ResearchProject } from "@/lib/types";
import { ProjectList } from "./project-list";
import { getResearchIndex } from "./research";

/* Reduced motion keeps every Reveal visible without an IntersectionObserver. */
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

const preprint: ResearchProject = {
  id: "ongoing-with-preprint",
  title: "TUM: Sparse Attention for Long Documents",
  description: "A preprint is out while the experiments continue.",
  status: "ongoing",
  publication: "https://www.arxiv.org/abs/2601.00001",
  keywords: [],
  highlights: [],
};
const unpublished: ResearchProject = {
  id: "ongoing-unpublished",
  title: "TUM: Tool Calling Benchmarks",
  description: "No paper yet.",
  status: "ongoing",
  keywords: [],
  highlights: [],
};

describe("ProjectList", () => {
  test("links an ongoing project's paper by its host and says it opens a new tab", async () => {
    const { ongoing } = getResearchIndex([preprint, unpublished]);
    const { container } = render(<ProjectList projects={ongoing} />);

    const withPaper = screen.getByRole("article", {
      name: "Sparse Attention for Long Documents",
    });
    const link = within(withPaper).getByRole("link", {
      name: /^Paper on arxiv\.org\s?\(opens in a new tab\)$/,
    });
    expect(link).toHaveAttribute("href", preprint.publication);
    expect(link).toHaveAttribute("target", "_blank");

    const withoutPaper = screen.getByRole("article", {
      name: "Tool Calling Benchmarks",
    });
    expect(within(withoutPaper).queryByRole("link")).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });

  test("draws the CMS motif behind the logos and lists the highlights", async () => {
    const { ongoing } = getResearchIndex([
      {
        ...unpublished,
        motif: "nested-clusters",
        highlights: ["2.3M single cells", "208 cell classes"],
      },
      preprint,
    ]);
    const { container } = render(<ProjectList projects={ongoing} />);

    const withMotif = screen.getByRole("article", {
      name: "Tool Calling Benchmarks",
    });
    const art = withMotif.querySelector("svg[data-motif]");
    expect(art).toHaveAttribute("data-motif", "nested-clusters");
    // Decorative: inside the tile assistive tech skips.
    expect(art?.closest("[aria-hidden='true']")).not.toBeNull();
    expect(
      within(
        within(withMotif).getByRole("list", { name: "Highlights" }),
      ).getAllByRole("listitem"),
    ).toHaveLength(2);

    const plain = screen.getByRole("article", {
      name: "Sparse Attention for Long Documents",
    });
    expect(plain.querySelector("svg[data-motif]")).toBeNull();
    expect(
      within(plain).queryByRole("list", { name: "Highlights" }),
    ).not.toBeInTheDocument();
    expect(await axe(container)).toHaveNoViolations();
  });
});
