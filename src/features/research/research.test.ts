import { describe, expect, test } from "vitest";
import { getMockResearchProjects } from "@/lib/mock-cms";
import type { Partner, ResearchProject } from "@/lib/types";
import {
  cleanKeywords,
  distanceKm,
  getLabSites,
  getPartnerLogos,
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

function partner(overrides: Partial<Partner>): Partner {
  return {
    id: "p",
    name: "Partner",
    category: "Research Partners",
    ...overrides,
  };
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
    const index = getResearchIndex([
      project({ id: "a", title: "MIT: Done", status: "completed" }),
      project({ id: "b", title: "IBM Almaden: One" }),
      project({ id: "c", title: "LMU Klinikum, TUM, CAMP: Two" }),
      project({ id: "d", title: "TUM CAMP, IBM Almaden: Three" }),
    ]);
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
    const index = getResearchIndex(getMockResearchProjects());
    for (const entry of [...index.ongoing, ...index.completed]) {
      for (const { name, index: position } of entry.affiliations) {
        expect(index.affiliations[position - 1]).toBe(name);
      }
    }
  });

  test("splits by status in CMS order and drops projects without one", () => {
    const { ongoing, completed } = getResearchIndex([
      project({ id: "a", status: "completed" }),
      project({ id: "b", status: "ongoing" }),
      project({ id: "c", status: undefined }),
      project({ id: "d", status: "completed" }),
      project({ id: "e", status: "ongoing" }),
    ]);
    expect(ongoing.map(({ id }) => id)).toEqual(["b", "e"]);
    expect(completed.map(({ id }) => id)).toEqual(["a", "d"]);
  });

  test("shapes each entry on the server", () => {
    const {
      completed: [entry],
    } = getResearchIndex([
      project({
        id: "x1",
        title: "IBM Research: Regression-like Loss on Number Tokens",
        status: "completed",
        keywords: ["NLP", " NLP "],
        publication: "https://www.arxiv.org/abs/2411.02083",
        image: "https://cdn.sanity.io/images/x.webp",
      }),
    ]);
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
    } = getResearchIndex([
      project({ publication: "javascript:alert(1)", image: "" }),
    ]);
    expect(entry?.publicationUrl).toBeUndefined();
    expect(entry?.publicationHost).toBeUndefined();
    expect(entry?.image).toBeUndefined();
  });
});

describe("getPartnerLogos", () => {
  test("keeps partners with artwork, reads the ratio from Sanity file names", () => {
    expect(
      getPartnerLogos([
        partner({
          name: " MIT ",
          image:
            "https://cdn.sanity.io/images/o9uuv2sq/production/e566c0-1024x530.png",
          link: "https://www.mit.edu/",
        }),
        partner({ name: "No artwork", link: "https://example.org" }),
        partner({
          name: "Local",
          image: "/assets/partners/logos/ibm.png",
          link: "javascript:alert(1)",
        }),
        partner({ name: "  ", image: "/x.png" }),
      ]),
    ).toEqual([
      {
        name: "MIT",
        src: "https://cdn.sanity.io/images/o9uuv2sq/production/e566c0-1024x530.png",
        href: "https://www.mit.edu/",
        aspectRatio: 1024 / 530,
      },
      {
        name: "Local",
        src: "/assets/partners/logos/ibm.png",
        href: undefined,
        aspectRatio: undefined,
      },
    ]);
  });
});

describe("getLabSites", () => {
  // The institutions the live CMS, partners and REX copy name (2026-09).
  const liveNames = [
    "University of Cambridge",
    "IBM Almaden",
    "Helmholtz Zentrum",
    "TUM CAMP",
    "LMU Klinikum",
    "MIT",
    "IBM Research",
    "Klinikum rechts der Isar",
    "IBM",
    "LMU",
    "flowerlabs",
    "Helmholtz",
    "Harvard Medical School",
    "MI4People",
    "Harvard University",
    "University of Cambridge",
    "Inria",
  ];

  test("places every live institution but the ambiguous and unknown ones", () => {
    const { sites, unplaced } = getLabSites(liveNames);
    expect(unplaced).toEqual(["IBM", "flowerlabs"]);
    expect(sites.map(({ id }) => id)).toEqual([
      "munich",
      "boston",
      "cambridge",
      "san-jose",
      "zurich",
      "paris",
    ]);
    expect(sites.find(({ id }) => id === "boston")?.institutions).toEqual([
      "MIT",
      "Harvard Medical School",
      "Harvard University",
    ]);
  });

  test("always includes home, where the arcs start", () => {
    const { sites } = getLabSites(["mit"]);
    expect(sites.map(({ id, home }) => [id, Boolean(home)])).toEqual([
      ["munich", true],
      ["boston", false],
    ]);
    expect(sites[0]?.institutions).toEqual([]);
  });

  test("every site sits on the globe", () => {
    for (const { location } of getLabSites(liveNames).sites) {
      const [latitude, longitude] = location;
      expect(Math.abs(latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(longitude)).toBeLessThanOrEqual(180);
    }
  });
});

test("distanceKm measures great circles", () => {
  // Munich to MIT is about 6,183 km; a point to itself is 0.
  expect(distanceKm([48.1497, 11.5679], [42.3601, -71.0942])).toBeCloseTo(
    6183,
    0,
  );
  expect(distanceKm([10, 20], [10, 20])).toBe(0);
});

test("each site knows how far its nearest neighbour is", () => {
  const { sites } = getLabSites(["MIT", "IBM Research"]);
  const km = Object.fromEntries(
    sites.map(({ id, nearestKm }) => [id, Math.round(nearestKm)]),
  );
  // Munich and Zurich are each other's nearest; Boston's is Zurich.
  expect(km.munich).toBe(km.zurich);
  expect(km.munich).toBeLessThan(300);
  expect(km.boston).toBeGreaterThan(5000);
  expect(getLabSites([]).sites[0]?.nearestKm).toBe(Number.POSITIVE_INFINITY);
});
