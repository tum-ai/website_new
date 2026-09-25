import { existsSync } from "node:fs";
import { expect, test } from "vitest";
import { alumniDestinations, featuredPartners } from "./data/partner-logos";
import { marqueeLogos } from "./data/partner-marquee-logos";
import {
  partnerCaseStudies,
  partnerPillars,
  partnerProfiles,
} from "./data/partners";
import {
  getHighlightedPartners,
  getPartnerDirectory,
  getPartnerKey,
} from "./partner-directory";
import {
  getPartnershipBookingUrl,
  getPartnershipEmailUrl,
  getPartnershipRecommendation,
  initialFunnelState,
  partnershipFunnelReducer,
} from "./partnerships";

test("all eight paths produce the brief's recommendation", () => {
  const expected = {
    talent: ["Talent Activation", "Long-Term Partnership"],
    hackathon: ["Hackathon Participation", "Long-Term Partnership"],
    brand: ["Community & Brand Activation", "Long-Term Partnership"],
    research: ["Research Collaboration", "Research Collaboration"],
  } as const;
  for (const intent of ["talent", "hackathon", "brand", "research"] as const) {
    for (const [index, duration] of (
      ["one-off", "ongoing"] as const
    ).entries()) {
      expect(getPartnershipRecommendation({ intent, duration })?.name).toBe(
        expected[intent][index],
      );
    }
  }
  expect(
    getPartnershipRecommendation({ intent: "talent", duration: null }),
  ).toBeNull();
});

test("changing intent or going back clears stale recommendations and restart clears both answers", () => {
  let state = partnershipFunnelReducer(initialFunnelState, {
    type: "intent",
    intent: "hackathon",
  });
  state = partnershipFunnelReducer(state, {
    type: "duration",
    duration: "ongoing",
  });
  expect(state.step).toBe("result");
  state = partnershipFunnelReducer(state, { type: "back" });
  expect(state).toStrictEqual({
    step: "duration",
    intent: "hackathon",
    duration: null,
  });
  expect(getPartnershipRecommendation(state)).toBeNull();
  state = partnershipFunnelReducer(state, {
    type: "intent",
    intent: "research",
  });
  expect(state.duration).toBeNull();
  expect(state.step).toBe("duration");
  expect(partnershipFunnelReducer(state, { type: "reset" })).toStrictEqual(
    initialFunnelState,
  );
  expect(
    partnershipFunnelReducer(initialFunnelState, {
      type: "duration",
      duration: "ongoing",
    }),
  ).toStrictEqual(initialFunnelState);
});

test("email and booking carry readable, encoded intent, timeframe, and recommendation", () => {
  const selection = { intent: "hackathon", duration: "ongoing" } as const;
  const email = new URL(getPartnershipEmailUrl(selection));
  expect(email.protocol).toBe("mailto:");
  expect(email.pathname).toBe("partners@tum-ai.com");
  expect(email.searchParams.get("subject")).toBe(
    "Partnership request: Hackathon challenge",
  );
  expect(email.searchParams.get("body") ?? "").toMatch(
    /An ongoing, strategic relationship/,
  );
  expect(email.searchParams.get("body") ?? "").toMatch(
    /Long-Term Partnership \(with first-choice hackathons\)/,
  );
  const booking = new URL(getPartnershipBookingUrl(selection));
  expect(booking.origin).toBe("https://cal.eu");
  expect(booking.pathname).toBe("/silaszamzow/tumai-quick-chat");
  expect(booking.searchParams.getAll("guest")).toStrictEqual([
    "partners@tum-ai.com",
  ]);
  expect(booking.searchParams.get("notes") ?? "").toMatch(
    /Hackathon|hackathon/,
  );
  const defaultEmail = new URL(getPartnershipEmailUrl());
  expect(defaultEmail.pathname).toBe("partners@tum-ai.com");
  expect(defaultEmail.searchParams.get("cc")).toBe(
    "silas.zamzow@tum-ai.com,kim.schlemmer@tum-ai.com",
  );
  expect(defaultEmail.searchParams.getAll("cc").length).toBe(1);
  expect(defaultEmail.searchParams.get("subject") ?? "").toMatch(
    /^Partnership request/,
  );
  const brandEmail = new URL(
    getPartnershipEmailUrl({ intent: "brand", duration: "one-off" }),
  );
  expect(brandEmail.searchParams.get("body") ?? "").toMatch(
    /Community & Brand Activation/,
  );
});

test("launch defaults include the eighteen partners in tier order", () => {
  const result = getPartnerDirectory([]);
  expect(result.map((p) => p.name)).toStrictEqual([
    "OpenAI",
    "Google",
    "Anthropic",
    "Hudson River Trading",
    "JetBrains",
    "Unite",
    "NVIDIA",
    "Entire.io",
    "Spherecast",
    "Dryft",
    "Reply",
    "McKinsey & Company",
    "Jane Street",
    "BMW",
    "AWS",
    "Mutagent",
    "AMD",
    "IBM",
  ]);
  expect(result.map((p) => p.tier)).toStrictEqual([
    ...Array(8).fill("gold"),
    ...Array(7).fill("silver"),
    ...Array(3).fill("bronze"),
  ]);
});

test("every highlighted launch partner has a shipped marquee logo", () => {
  for (const partner of getHighlightedPartners(getPartnerDirectory([]))) {
    const image = marqueeLogos[getPartnerKey(partner.name)];
    expect(
      image,
      `Missing marquee logo mapping for ${partner.name}`,
    ).toBeTruthy();
    expect(
      existsSync(new URL(`../../../public${image}`, import.meta.url)),
      `Missing marquee asset for ${partner.name}: ${image}`,
    ).toBe(true);
  }
});

test("every curated logo, portrait, and case-study image ships with the page", () => {
  for (const item of [
    ...Object.values(marqueeLogos).map((image) => ({ image })),
    ...featuredPartners,
    ...alumniDestinations,
    ...partnerProfiles,
    ...partnerPillars,
    ...partnerCaseStudies,
  ]) {
    expect(item.image, "Missing curated partner image").toBeTruthy();
    expect(
      existsSync(new URL(`../../../public${item.image}`, import.meta.url)),
      `Missing public asset: ${item.image}`,
    ).toBe(true);
  }
});

test("CMS overrides defaults, aliases consolidate, and unclassified legacy entries become supporters", () => {
  const result = getPartnerDirectory([
    {
      id: "hrt-cms",
      name: "HRT",
      tier: "silver",
      featured: true,
      image: "https://cdn.example/hrt.svg",
    },
    {
      id: "hrt-legacy",
      name: "Hudson River Trading",
      category: "Industry Partners",
    },
    {
      id: "ibm-research",
      name: "IBM",
      category: "Research Partners",
      link: "https://ibm.com",
    },
    { id: "ibm-technical", name: "ibm", category: "Technical Partners" },
    { id: "missing-logo", name: "New partner", link: "javascript:alert(1)" },
  ]);
  const hrt = result.filter((p) => p.name === "Hudson River Trading");
  expect(hrt.length).toBe(1);
  expect(hrt[0].tier).toBe("silver");
  expect(hrt[0].featured).toBe(true);
  expect(hrt[0].image).toBe("https://cdn.example/hrt.svg");
  expect(result.find((p) => p.tier === "silver")?.name).toBe(
    "Hudson River Trading",
  );
  expect(result.filter((p) => p.name.toLowerCase() === "ibm").length).toBe(1);
  expect(result.find((p) => p.name === "IBM")?.tier).toBe("bronze");
  expect(result.find((p) => p.name === "New partner")?.link).toBeUndefined();
});

test("email CCs reach both partnership contacts with and without finder context", () => {
  for (const selection of [
    initialFunnelState,
    { intent: "hackathon", duration: "ongoing" } as const,
  ]) {
    const email = new URL(getPartnershipEmailUrl(selection));
    expect(email.pathname).toBe("partners@tum-ai.com");
    expect(email.searchParams.get("cc")).toBe(
      "silas.zamzow@tum-ai.com,kim.schlemmer@tum-ai.com",
    );
    expect(email.searchParams.getAll("cc").length).toBe(1);
    expect(email.searchParams.get("subject") ?? "").toMatch(
      /^Partnership request/,
    );
    expect(email.searchParams.get("body") ?? "").toMatch(/^Hi TUM.ai team,/);
  }
});

test("marquee includes every highlighted tier and follows CMS overrides and aliases", () => {
  expect(getHighlightedPartners(getPartnerDirectory([])).length).toBe(18);
  const directory = getPartnerDirectory([
    { id: "openai-cms", name: "OpenAI", tier: "supporter" },
    { id: "hrt-cms", name: "HRT", tier: "silver" },
    { id: "hrt-alias", name: "Hudson River Trading" },
    { id: "new-partner", name: "New partner", tier: "bronze" },
    { id: "legacy", name: "Legacy supporter", featured: true },
  ]);
  const highlighted = getHighlightedPartners(directory);
  expect(highlighted.length).toBe(18);
  expect(
    highlighted.filter((partner) => partner.name === "Hudson River Trading")
      .length,
  ).toBe(1);
  expect(highlighted.some((partner) => partner.name === "New partner")).toBe(
    true,
  );
  expect(highlighted.some((partner) => partner.name === "OpenAI")).toBe(false);
  expect(
    highlighted.some((partner) => partner.name === "Legacy supporter"),
  ).toBe(false);
  expect(getHighlightedPartners([])).toStrictEqual([]);
});
