import { afterEach, describe, expect, test, vi } from "vitest";
import { labSitesFixture as labSites } from "@/lib/cms-fixtures/programmes";
import { getMockResearchProjects } from "@/lib/mock-cms";
import type { Partner, ResearchProject } from "@/lib/types";
import {
  cleanKeywords,
  distanceKm,
  getLabSites,
  getPartnerLogos,
  getResearchIndex,
  type Institution,
  reportUnplaced,
} from "./research";
import { splitResearchTitle } from "./research-title";

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
    expect(index.affiliations.map(({ name }) => name)).toEqual([
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

  test("every citation points at the institution it names", async () => {
    const index = getResearchIndex(await getMockResearchProjects());
    for (const entry of [...index.ongoing, ...index.completed]) {
      for (const { name, index: position } of entry.affiliations) {
        expect(index.affiliations[position - 1]?.name).toBe(name);
      }
    }
  });

  test("cites the referenced organisations instead of the title's lead", () => {
    const index = getResearchIndex([
      project({
        id: "a",
        title: "Helmholtz Zentrum: Cells",
        institutions: [{ key: "helmholtz-munich", name: "Helmholtz Munich" }],
      }),
      project({ id: "b", title: "TUM CAMP: Video" }),
      project({
        id: "c",
        title: "TUM CAMP, Helmholtz Zentrum: Graphs",
        institutions: [
          { key: "tum-camp", name: "TUM CAMP" },
          { key: "helmholtz-munich", name: "Helmholtz Munich" },
        ],
      }),
    ]);
    expect(index.affiliations).toEqual([
      { key: "helmholtz-munich", name: "Helmholtz Munich" },
      { name: "TUM CAMP" },
    ]);
    expect(
      index.ongoing.map(({ title, affiliations }) => [
        title,
        affiliations.map(({ index }) => index),
      ]),
    ).toEqual([
      ["Cells", [1]],
      ["Video", [2]],
      ["Graphs", [2, 1]],
    ]);
  });

  test("reads the title's lead when no reference resolves", () => {
    const {
      ongoing: [entry],
    } = getResearchIndex([
      project({
        title: "MIT: Engines",
        // A reference to a deleted organisation projects as null.
        institutions: [null as never],
      }),
    ]);
    expect(entry?.affiliations).toEqual([{ name: "MIT", index: 1 }]);
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
          image: "/assets/fixtures/logo.svg",
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
        src: "/assets/fixtures/logo.svg",
        href: undefined,
        aspectRatio: undefined,
      },
    ]);
  });
});

describe("getLabSites", () => {
  const liveInstitutions: Institution[] = [
    { key: "example-company", name: "Example Company" },
    { name: "Example Lab" },
  ];
  const zurich = {
    id: "zurich",
    city: "Zurich",
    location: [47.3769, 8.5417] as [number, number],
    organizations: [
      { key: "eth-zurich", name: "ETH Zürich", shortName: "ETH" },
    ],
  };
  const home = labSites.filter((site) => site.home);

  test("places institutions on the list it is given (the CMS lab sites)", () => {
    const { sites, unplaced } = getLabSites(
      [{ key: "eth-zurich", name: "ETH Zürich" }, { name: "MIT" }],
      [...home, zurich],
    );
    expect(sites.map(({ id }) => id)).toEqual([
      ...home.map(({ id }) => id),
      "zurich",
    ]);
    expect(unplaced).toEqual(["MIT"]);
  });

  test("matches an organisation by key, and a title's name by its spellings", () => {
    for (const institution of [
      { key: "eth-zurich", name: "Renamed" },
      { name: "eth zürich" },
      { name: "ETH" },
      { name: "eth-zurich" },
    ]) {
      expect(
        getLabSites([institution], [...home, zurich]).unplaced,
        institution.name,
      ).toEqual([]);
    }
    // A key names the organisation; its name alone never places it.
    expect(
      getLabSites([{ key: "eth", name: "ETH Zürich" }], [...home, zurich])
        .unplaced,
    ).toEqual(["ETH Zürich"]);
  });

  test("places institutions by key and short name", () => {
    const { sites, unplaced } = getLabSites(liveInstitutions, labSites);
    expect(unplaced).toEqual([]);
    expect(sites.map((site) => site.id)).toEqual(["home", "remote"]);
    expect(
      getLabSites([{ name: "Lab" }], labSites).sites.at(-1)?.institutions,
    ).toEqual(["Lab"]);
  });
  test("always includes the supplied home site", () => {
    expect(getLabSites([], labSites).sites.map((site) => site.id)).toEqual([
      "home",
    ]);
  });

  test("every site sits on the globe", () => {
    for (const { location } of getLabSites(liveInstitutions, labSites).sites) {
      const [latitude, longitude] = location;
      expect(Math.abs(latitude)).toBeLessThanOrEqual(90);
      expect(Math.abs(longitude)).toBeLessThanOrEqual(180);
    }
  });
});

describe("reportUnplaced", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("warns about the institutions the globe leaves out, once each", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportUnplaced(["Nowhere Lab", "Elsewhere Institute"]);
    reportUnplaced(["Nowhere Lab"]);
    reportUnplaced([]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.[0]).toContain(
      "Nowhere Lab, Elsewhere Institute",
    );
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

test("each site measures its nearest neighbour", () => {
  const { sites } = getLabSites([{ name: "Example Lab" }], labSites);
  expect(sites[0]?.nearestKm).toBe(sites[1]?.nearestKm);
  expect(sites[0]?.nearestKm).toBeGreaterThan(5000);
  expect(getLabSites([], labSites).sites[0]?.nearestKm).toBe(
    Number.POSITIVE_INFINITY,
  );
});
