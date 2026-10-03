import { axe } from "@test/axe";
import { render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  labSitesFixture,
  researchCopyFixture as researchCopy,
} from "@/lib/cms-fixtures/programmes";
import { getMockResearchProjects } from "@/lib/mock-cms";
import type { Partner } from "@/lib/types";

vi.mock("./content", () => ({
  getResearchCopy: async () => researchCopy,
  getLabSiteList: async () => labSitesFixture,
}));
vi.mock("./rex-content", () => ({ getRexInstitutions: async () => [] }));

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

const projects = await getMockResearchProjects();
const partners = vi.hoisted((): Partner[] => [
  {
    id: "ibm",
    name: "IBM",
    image: "/assets/fixtures/logo.svg",
    link: "https://www.ibm.com/",
    category: "Research Partners",
  },
  { id: "hms", name: "Harvard Medical School", category: "Research Partners" },
]);

vi.mock("@/features/partners/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/features/partners/server")>()),
  getResearchPartners: async () => partners,
}));
const index = getResearchIndex(projects);

const { closing } = researchCopy;

async function renderPage() {
  return render(await ResearchPage({ projects }));
}

describe("ResearchPage", () => {
  test("has one h1 and a section heading per band", async () => {
    const { container } = await renderPage();
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

  test("opens on the affiliation index, closes on it with an open slot", async () => {
    await renderPage();
    const [opening, closingList] = screen.getAllByRole("list", {
      name: "Affiliations",
    });
    if (!opening || !closingList) throw new Error("both indexes render");
    expect(
      within(opening)
        .getAllByRole("listitem")
        .map((item) => item.textContent),
    ).toEqual(index.affiliations.map(({ name }, i) => `${i + 1}${name}`));
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

  test("reports the institutions the globe cannot place", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(
      await ResearchPage({
        projects: [
          ...projects,
          {
            id: "unplaced",
            title: "Atlantis Institute: Tides",
            description: "A lab no lab site lists.",
            status: "ongoing",
            keywords: [],
          },
        ],
      }),
    );
    expect(
      warn.mock.calls.some(([message]) =>
        String(message).includes("Atlantis Institute"),
      ),
    ).toBe(true);
    warn.mockRestore();
  });

  test("lists every project once and links each paper by its host", async () => {
    await renderPage();
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
