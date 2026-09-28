import { describe, expect, test } from "vitest";
import { getMockResearchProjects } from "@/lib/mock-cms";
import type { Partner, ResearchProject } from "@/lib/types";
import {
  cleanKeywords,
  getResearchIndex,
  splitResearchTitle,
} from "./research";

function project(overrides: Partial<ResearchProject> = {}): ResearchProject {
  return {
    id: "research-1",
    title: "TUM: Robotic Manipulation",
    description: "Grounding instructions in manipulation policies.",
    status: "ongoing",
    keywords: [],
    ...overrides,
  };
}

function partner(name: string): Partner {
  return { id: name, name, category: "Research Partners" };
}

describe("splitResearchTitle", () => {
  test.each([
    ["IBM Almaden: Sycophancy in LMs", ["IBM Almaden"], "Sycophancy in LMs"],
    [
      "University of Cambridge, Prof. Olaf Wysocki: Aerial Visual Localization",
      ["University of Cambridge"],
      "Aerial Visual Localization",
    ],
    [
      "LMU Klinikum, TUM, CAMP: 4D Gaussians & Scene Graphs",
      ["LMU Klinikum", "TUM CAMP"],
      "4D Gaussians & Scene Graphs",
    ],
    [
      "MIT: Reaction Graph Networks for Synthesis\nCondition Prediction",
      ["MIT"],
      "Reaction Graph Networks for Synthesis Condition Prediction",
    ],
    [" MIT: Neural Prediction ", ["MIT"], "Neural Prediction"],
    ["Dr. Ada Lovelace, MIT, mit: Engines", ["MIT"], "Engines"],
    ["A title without institutions", [], "A title without institutions"],
    ["Helmholtz:", ["Helmholtz"], "Helmholtz:"],
  ])("%j", (raw, institutions, title) => {
    expect(splitResearchTitle(raw)).toEqual({ institutions, title });
  });
});

describe("cleanKeywords", () => {
  test("trims, drops empty and repeated keywords, keeps CMS order", () => {
    expect(cleanKeywords([" NLP", "Vision ", "", "  ", "NLP", "RL"])).toEqual([
      "NLP",
      "Vision",
      "RL",
    ]);
  });
});

describe("getResearchIndex", () => {
  test("numbers institutions by first appearance, ongoing before completed", () => {
    const index = getResearchIndex(
      [
        project({ id: "a", title: "MIT: Done", status: "completed" }),
        project({ id: "b", title: "IBM Almaden: One" }),
        project({ id: "c", title: "LMU Klinikum, TUM, CAMP: Two" }),
        project({ id: "d", title: "TUM CAMP, IBM Almaden: Three" }),
      ],
      [],
    );
    expect(index.affiliations).toEqual([
      "IBM Almaden",
      "LMU Klinikum",
      "TUM CAMP",
      "MIT",
    ]);
    expect(
      [...index.ongoing, ...index.completed].map(({ id, affiliations }) => [
        id,
        affiliations.map(({ index }) => index),
      ]),
    ).toEqual([
      ["b", [1]],
      ["c", [2, 3]],
      ["d", [3, 1]],
      ["a", [4]],
    ]);
  });

  test("every citation points at the institution it names", () => {
    const index = getResearchIndex(getMockResearchProjects(), []);
    for (const entry of [...index.ongoing, ...index.completed]) {
      for (const { name, index: position } of entry.affiliations) {
        expect(index.affiliations[position - 1]).toBe(name);
      }
    }
  });

  test("lists research partners no project names, without numbers", () => {
    const index = getResearchIndex(
      [
        project({ title: "IBM Almaden: One" }),
        project({ id: "b", title: "Helmholtz Zentrum: Two" }),
      ],
      [
        partner("IBM"),
        partner("Helmholtz"),
        partner("Harvard Medical School"),
        partner("harvard medical school"),
        partner("  "),
        partner("MI4People"),
      ],
    );
    expect(index.affiliations).toEqual(["IBM Almaden", "Helmholtz Zentrum"]);
    expect(index.otherPartners).toEqual([
      "Harvard Medical School",
      "MI4People",
    ]);
  });

  test("splits by status in CMS order and drops projects without one", () => {
    const { ongoing, completed } = getResearchIndex(
      [
        project({ id: "a", status: "completed" }),
        project({ id: "b", status: "ongoing" }),
        project({ id: "c", status: undefined }),
        project({ id: "d", status: "completed" }),
        project({ id: "e", status: "ongoing" }),
      ],
      [],
    );
    expect(ongoing.map(({ id }) => id)).toEqual(["b", "e"]);
    expect(completed.map(({ id }) => id)).toEqual(["a", "d"]);
  });

  test("shapes each entry on the server", () => {
    const {
      completed: [entry],
    } = getResearchIndex(
      [
        project({
          id: "x1",
          title: "IBM Research: Regression-like Loss on Number Tokens",
          status: "completed",
          keywords: ["NLP", " NLP "],
          publication: "https://www.arxiv.org/abs/2411.02083",
          image: "https://cdn.sanity.io/images/x.webp",
        }),
      ],
      [],
    );
    expect(entry).toEqual({
      id: "x1",
      titleId: "research-x1-title",
      title: "Regression-like Loss on Number Tokens",
      description: "Grounding instructions in manipulation policies.",
      image: "https://cdn.sanity.io/images/x.webp",
      publicationUrl: "https://www.arxiv.org/abs/2411.02083",
      publicationHost: "arxiv.org",
      keywords: ["NLP"],
      status: "completed",
      affiliations: [{ name: "IBM Research", index: 1 }],
    });
  });

  test("drops unsafe publication links and empty images", () => {
    const {
      ongoing: [entry],
    } = getResearchIndex(
      [project({ publication: "javascript:alert(1)", image: "" })],
      [],
    );
    expect(entry?.publicationUrl).toBeUndefined();
    expect(entry?.publicationHost).toBeUndefined();
    expect(entry?.image).toBeUndefined();
  });
});
