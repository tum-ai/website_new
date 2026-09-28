import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getMockResearchProjects } from "@/lib/mock-cms";
import type { Partner } from "@/lib/types";
import { closing } from "./data/research-copy";
import { getResearchIndex } from "./research";
import { ResearchPage } from "./research-page";

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

const projects = getMockResearchProjects();
const partners: Partner[] = [
  {
    id: "ibm",
    name: "IBM",
    image: "/assets/partners/logos/ibm.png",
    link: "https://www.ibm.com/",
    category: "Research Partners",
  },
  { id: "hms", name: "Harvard Medical School", category: "Research Partners" },
];
const index = getResearchIndex(projects);

function renderPage() {
  return render(
    <ResearchPage projects={projects} researchPartners={partners} />,
  );
}

describe("ResearchPage", () => {
  test("has one h1 and a section heading per band", async () => {
    const { container } = renderPage();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([
      "Abstract",
      `In progress (${index.ongoing.length})`,
      `Completed (${index.completed.length})`,
      "Research abroad",
      closing.title,
    ]);
    expect(await axe(container)).toHaveNoViolations();
  });

  test("opens on the affiliation index, closes on it with an open slot", () => {
    renderPage();
    const [opening, closingList] = screen.getAllByRole("list", {
      name: "Affiliations",
    });
    if (!opening || !closingList) throw new Error("both indexes render");
    expect(
      within(opening)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(index.affiliations.map((name, i) => `${i + 1}${name}`));
    expect(
      within(closingList).getAllByRole("listitem").at(-1),
    ).toHaveTextContent(`${index.affiliations.length + 1}${closing.openSlot}`);
    // Only partners with artwork make the strip; each links to its lab.
    expect(
      within(
        screen.getByRole("list", { name: "Research partners" }),
      ).getAllByRole("link"),
    ).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: /^IBM\s?\(opens in a new tab\)$/ }),
    ).toHaveAttribute("href", "https://www.ibm.com/");
  });

  test("lists every project once and links each paper by its host", () => {
    renderPage();
    for (const entry of [...index.ongoing, ...index.completed]) {
      expect(
        screen.getByRole("article", { name: entry.title }),
      ).toBeInTheDocument();
    }
    for (const entry of index.completed) {
      if (!entry.publicationUrl) continue;
      expect(
        screen.getByRole("link", {
          name: new RegExp(`^Paper on ${entry.publicationHost}`),
        }),
      ).toHaveAttribute("href", entry.publicationUrl);
    }
  });
});
