import { describe, expect, test } from "vitest";
import type { Partner, ResearchProject } from "@/lib/types";
import {
  cleanKeywords,
  formatCounter,
  getCollaboratorLogos,
  getCollaboratorName,
  getLogoColumns,
  getResearchProjectLists,
  researchStatusLabels,
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

describe("getCollaboratorName", () => {
  test.each([
    ["IBM Research: Earth Observation", "IBM"],
    ["MIT, Evaluating Reasoning", "MIT"],
    ["TUM Chair of Robotics: Grasping", "TUM"],
    ["LMU: Medical Imaging", "LMU"],
    ["Helmholtz Munich: Protein Models", "Helmholtz"],
    ["The University of Cambridge: Causality", "University of Cambridge"],
    ["INRIA Paris: Graph Learning", "INRIA Paris"],
    ["Stanford, Vision Lab: Benchmarks", "Stanford"],
    ["  Standalone title  ", "Standalone title"],
  ])("%s → %s", (title, collaborator) => {
    expect(getCollaboratorName(title)).toBe(collaborator);
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

test("formatCounter numbers from 01", () => {
  expect(formatCounter(0)).toBe("01");
  expect(formatCounter(9)).toBe("10");
  expect(formatCounter(99)).toBe("100");
});

describe("getResearchProjectLists", () => {
  test("splits by status in CMS order and drops projects without one", () => {
    const { ongoing, past } = getResearchProjectLists([
      project({ id: "a", status: "completed" }),
      project({ id: "b", status: "ongoing" }),
      project({ id: "c", status: undefined }),
      project({ id: "d", status: "completed" }),
      project({ id: "e", status: "ongoing" }),
    ]);
    expect(ongoing.map(({ id }) => id)).toEqual(["b", "e"]);
    expect(past.map(({ id }) => id)).toEqual(["a", "d"]);
  });

  test("shapes the card data on the server", () => {
    const {
      ongoing: [card],
    } = getResearchProjectLists([
      project({
        id: "x1",
        title: "IBM Research: Earth Observation",
        keywords: ["Remote Sensing", " Remote Sensing "],
        publication: "https://arxiv.org/abs/2310.18660",
        image: "https://cdn.sanity.io/images/x.webp",
      }),
    ]);
    expect(card).toEqual({
      id: "x1",
      titleId: "research-x1-title",
      title: "IBM Research: Earth Observation",
      description: "Grounding instructions in manipulation policies.",
      image: "https://cdn.sanity.io/images/x.webp",
      publicationUrl: "https://arxiv.org/abs/2310.18660",
      keywords: ["Remote Sensing"],
      status: "ongoing",
      statusLabel: researchStatusLabels.ongoing,
      collaborator: "IBM",
    });
  });

  test("labels every status", () => {
    const { ongoing, past } = getResearchProjectLists([
      project({ id: "a", status: "ongoing" }),
      project({ id: "b", status: "completed" }),
    ]);
    expect(ongoing[0]?.statusLabel).toBe("Ongoing");
    expect(past[0]?.statusLabel).toBe("Completed");
  });

  test("drops unsafe publication links and empty images", () => {
    const {
      ongoing: [card],
    } = getResearchProjectLists([
      project({ publication: "javascript:alert(1)", image: "" }),
    ]);
    expect(card?.publicationUrl).toBeUndefined();
    expect(card?.image).toBeUndefined();
  });
});

describe("getCollaboratorLogos", () => {
  const partner = (overrides: Partial<Partner>): Partner => ({
    id: overrides.name ?? "p",
    name: "Partner",
    category: "Research Partners",
    ...overrides,
  });

  test("keeps partners with a link and a logo, in CMS order", () => {
    expect(
      getCollaboratorLogos([
        partner({ name: "A", link: "https://a.org", image: "/a.svg" }),
        partner({ name: "B", link: "https://b.org" }),
        partner({ name: "C", image: "/c.svg" }),
        partner({ name: "D", link: "https://d.org", image: "/d.svg" }),
      ]),
    ).toEqual([
      { name: "A", src: "/a.svg", href: "https://a.org", alt: "A" },
      { name: "D", src: "/d.svg", href: "https://d.org", alt: "D" },
    ]);
  });
});

test("getLogoColumns fills whole rows", () => {
  expect([1, 2, 3, 4, 5, 6, 9].map(getLogoColumns)).toEqual([
    3, 3, 3, 4, 5, 6, 6,
  ]);
});
