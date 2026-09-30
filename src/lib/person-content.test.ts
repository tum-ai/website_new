import { afterEach, describe, expect, test, vi } from "vitest";
import { buildOrganizationDocument } from "./organization-content";
import {
  buildPersonBackfill,
  getPeople,
  personId,
  personKey,
} from "./person-content";

afterEach(() => {
  vi.unstubAllEnvs();
});

const ada = {
  key: "ada-lovelace",
  name: "Ada Lovelace",
  role: "Analyst @ Engines",
  quote: "It weaves algebraic patterns.",
  portrait: {
    src: "/assets/e-lab/testimonials/leon_hergert.png",
    objectPosition: "50% 30%",
  },
  organization: "engines",
};

describe("person helpers", () => {
  test("keys come from names, ids from placement and key", () => {
    expect(personKey("Xabier Irizar")).toBe("xabier-irizar");
    expect(personKey("Axel Täubert")).toBe("axel-taubert");
    expect(personId("e-lab-testimonial", "leon-hergert")).toBe(
      "person-e-lab-testimonial-leon-hergert",
    );
  });

  test("the backfill orders people and references their organisation", () => {
    const [document] = buildPersonBackfill("e-lab-testimonial", [ada]);
    expect(document).toMatchObject({
      _id: "person-e-lab-testimonial-ada-lovelace",
      _type: "person",
      placement: "e-lab-testimonial",
      key: "ada-lovelace",
      order: 10,
      quote: ada.quote,
      organization: { _type: "reference", _ref: "organization-engines" },
      portrait: { hotspot: { x: 0.5, y: 0.3 } },
    });
    expect(document).not.toHaveProperty("story");
  });
});

describe("getPeople", () => {
  test("maps the CMS people and drops the ones `select` rejects", async () => {
    vi.stubEnv("CMS_CONTENT_SOURCE", "sanity");
    vi.stubEnv("USE_MOCK_CMS", "1");
    vi.stubEnv("VERCEL", "");
    const people = await getPeople({
      placement: "e-lab-testimonial",
      fallback: ["code"],
      label: "test",
      mockDocuments: () => [
        buildOrganizationDocument({ key: "engines", name: "Engines" }),
        ...buildPersonBackfill("e-lab-testimonial", [
          ada,
          { ...ada, key: "no-quote", quote: undefined },
        ]),
      ],
      select: (person) =>
        person.quote
          ? `${person.name} (${person.organization?.name}, ${person.portrait.hotspot?.y})`
          : null,
    });
    expect(people).toStrictEqual(["Ada Lovelace (Engines, 0.3)"]);
  });
});
