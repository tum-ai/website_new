import { describe, expect, test } from "vitest";
import {
  eLabVoices,
  notableStartupOf,
  notableStartups,
  testimonialCards,
  tracedVenture,
  tracedVentureLead,
} from "./venture-page";

const testimonialIds = new Set(testimonialCards.map((card) => card.id));

describe("referenced ids", () => {
  // A mismatch would silently drop a quote or the whole trace section.
  test("the traced venture points at an alumni startup and a testimonial", () => {
    expect(notableStartups.map((startup) => startup.id)).toContain(
      tracedVenture.startupId,
    );
    expect(testimonialIds).toContain(tracedVenture.testimonialId);
  });

  test("every voice in the voices band has a testimonial", () => {
    for (const id of [...eLabVoices.founders, ...eLabVoices.investors]) {
      expect(testimonialIds, id).toContain(id);
    }
  });
});

describe("tracedVentureLead", () => {
  test("names the cohort, the first milestone and what the company does now", () => {
    expect(
      tracedVentureLead("Acme", {
        cohort: "E-Lab 1.0",
        now: "builds robots",
        after: [{ text: "Y Combinator" }, { text: "Offices" }],
      }),
    ).toBe(
      "Acme came out of E-Lab 1.0, went on to Y Combinator, and now builds robots.",
    );
  });

  test("leaves out clauses it has no data for instead of leaving them empty", () => {
    expect(tracedVentureLead("Acme", { cohort: "E-Lab 1.0", after: [] })).toBe(
      "Acme came out of E-Lab 1.0.",
    );
    expect(
      tracedVentureLead("Acme", {
        cohort: "E-Lab 1.0",
        now: "builds robots",
        after: [],
      }),
    ).toBe("Acme came out of E-Lab 1.0, and now builds robots.");
  });
});

describe("notableStartupOf", () => {
  const logo = {
    src: "/assets/e-lab/startups/Spherecast.webp",
    alt: "Spherecast logo",
    width: 400,
    height: 100,
  };

  // The Studio's website field is optional: clearing it must not drop the
  // venture, or with it the traced venture's whole band.
  test("keeps a venture without a website, unlinked", () => {
    expect(
      notableStartupOf({ key: "spherecast", name: "Spherecast", logo }),
    ).toStrictEqual({
      id: "spherecast",
      name: "Spherecast",
      logoSrc: logo.src,
      logoAlt: logo.alt,
    });
  });

  test("links a venture with a website", () => {
    expect(
      notableStartupOf({
        key: "spherecast",
        name: "Spherecast",
        href: "https://www.spherecast.ai/",
        logo,
      })?.href,
    ).toBe("https://www.spherecast.ai/");
  });

  test("drops a venture without a light logo, which it cannot draw", () => {
    expect(
      notableStartupOf({
        key: "spherecast",
        name: "Spherecast",
        href: "https://www.spherecast.ai/",
      }),
    ).toBeNull();
  });
});
