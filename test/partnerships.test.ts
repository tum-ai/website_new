import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import {
  alumniDestinations,
  featuredPartners,
} from "../src/data/partner-logos";
import { marqueeLogos } from "../src/data/partner-marquee-logos";
import {
  partnerCaseStudies,
  partnerPillars,
  partnerProfiles,
} from "../src/data/partners";
import { getMobileHeaderVisibility } from "../src/lib/header-visibility";
import {
  getHighlightedPartners,
  getPartnerDirectory,
  getPartnerKey,
} from "../src/lib/partner-directory";
import {
  getPartnershipBookingUrl,
  getPartnershipEmailUrl,
  getPartnershipRecommendation,
  initialFunnelState,
  partnershipFunnelReducer,
} from "../src/lib/partnerships";

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
      assert.equal(
        getPartnershipRecommendation({ intent, duration })?.name,
        expected[intent][index],
      );
    }
  }
  assert.equal(
    getPartnershipRecommendation({ intent: "talent", duration: null }),
    null,
  );
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
  assert.equal(state.step, "result");
  state = partnershipFunnelReducer(state, { type: "back" });
  assert.deepEqual(state, {
    step: "duration",
    intent: "hackathon",
    duration: null,
  });
  assert.equal(getPartnershipRecommendation(state), null);
  state = partnershipFunnelReducer(state, {
    type: "intent",
    intent: "research",
  });
  assert.equal(state.duration, null);
  assert.equal(state.step, "duration");
  assert.deepEqual(
    partnershipFunnelReducer(state, { type: "reset" }),
    initialFunnelState,
  );
  assert.deepEqual(
    partnershipFunnelReducer(initialFunnelState, {
      type: "duration",
      duration: "ongoing",
    }),
    initialFunnelState,
  );
});

test("email and booking carry readable, encoded intent, timeframe, and recommendation", () => {
  const selection = { intent: "hackathon", duration: "ongoing" } as const;
  const email = new URL(getPartnershipEmailUrl(selection));
  assert.equal(email.protocol, "mailto:");
  assert.equal(email.pathname, "partners@tum-ai.com");
  assert.equal(
    email.searchParams.get("subject"),
    "Partnership request — Hackathon challenge",
  );
  assert.match(
    email.searchParams.get("body") ?? "",
    /An ongoing, strategic relationship/,
  );
  assert.match(
    email.searchParams.get("body") ?? "",
    /Long-Term Partnership \(with first-choice hackathons\)/,
  );
  const booking = new URL(getPartnershipBookingUrl(selection));
  assert.equal(booking.origin, "https://cal.eu");
  assert.equal(booking.pathname, "/silaszamzow/tumai-quick-chat");
  assert.match(booking.searchParams.get("notes") ?? "", /Hackathon|hackathon/);
  assert.match(
    getPartnershipEmailUrl(initialFunnelState),
    /subject=Partnership%20request/,
  );
  const brandEmail = new URL(
    getPartnershipEmailUrl({ intent: "brand", duration: "one-off" }),
  );
  assert.match(
    brandEmail.searchParams.get("body") ?? "",
    /Community & Brand Activation/,
  );
});

test("launch defaults include the ten named partners in the specified order", () => {
  const result = getPartnerDirectory([]);
  assert.deepEqual(
    result.map((p) => p.name),
    [
      "OpenAI",
      "Google",
      "Anthropic",
      "Hudson River Trading",
      "JetBrains",
      "Unite",
      "Spherecast",
      "Dryft",
      "Reply",
      "Mutagent",
    ],
  );
  assert.deepEqual(
    result.map((p) => p.tier),
    [
      "gold",
      "gold",
      "gold",
      "gold",
      "gold",
      "gold",
      "silver",
      "silver",
      "silver",
      "bronze",
    ],
  );
});

test("every highlighted launch partner has a shipped marquee logo", () => {
  for (const partner of getHighlightedPartners(getPartnerDirectory([]))) {
    const image = marqueeLogos[getPartnerKey(partner.name)];
    assert.ok(image, `Missing marquee logo mapping for ${partner.name}`);
    assert.ok(
      existsSync(new URL(`../public${image}`, import.meta.url)),
      `Missing marquee asset for ${partner.name}: ${image}`,
    );
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
    assert.ok(item.image, "Missing curated partner image");
    assert.ok(
      existsSync(new URL(`../public${item.image}`, import.meta.url)),
      `Missing public asset: ${item.image}`,
    );
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
  assert.equal(hrt.length, 1);
  assert.equal(hrt[0].tier, "silver");
  assert.equal(hrt[0].featured, true);
  assert.equal(hrt[0].image, "https://cdn.example/hrt.svg");
  assert.equal(
    result.find((p) => p.tier === "silver")?.name,
    "Hudson River Trading",
  );
  assert.equal(result.filter((p) => p.name.toLowerCase() === "ibm").length, 1);
  assert.equal(result.find((p) => p.name === "ibm")?.tier, "supporter");
  assert.equal(result.find((p) => p.name === "New partner")?.link, undefined);
});

test("partner navigation remains visible while ordinary mobile navigation can hide", () => {
  const input = {
    scrollY: 500,
    previousScrollY: 100,
    isMenuOpen: false,
    isCurrentlyVisible: true,
  };
  assert.equal(
    getMobileHeaderVisibility({ ...input, keepVisible: true }),
    true,
  );
  assert.equal(getMobileHeaderVisibility(input), false);
});

test("email CCs reach both partnership contacts with and without finder context", () => {
  for (const selection of [
    initialFunnelState,
    { intent: "hackathon", duration: "ongoing" } as const,
  ]) {
    const email = new URL(getPartnershipEmailUrl(selection));
    assert.equal(email.pathname, "partners@tum-ai.com");
    assert.equal(
      email.searchParams.get("cc"),
      "silas.zamzow@tum-ai.com,kim.schlemmer@tum-ai.com",
    );
    assert.equal(email.searchParams.getAll("cc").length, 1);
    assert.match(
      email.searchParams.get("subject") ?? "",
      /^Partnership request/,
    );
    assert.match(email.searchParams.get("body") ?? "", /^Hi TUM.ai team,/);
  }
});

test("marquee includes every highlighted tier and follows CMS overrides and aliases", () => {
  assert.equal(getHighlightedPartners(getPartnerDirectory([])).length, 10);
  const directory = getPartnerDirectory([
    { id: "openai-cms", name: "OpenAI", tier: "supporter" },
    { id: "hrt-cms", name: "HRT", tier: "silver" },
    { id: "hrt-alias", name: "Hudson River Trading" },
    { id: "new-partner", name: "New partner", tier: "bronze" },
    { id: "legacy", name: "Legacy supporter", featured: true },
  ]);
  const highlighted = getHighlightedPartners(directory);
  assert.equal(highlighted.length, 10);
  assert.equal(
    highlighted.filter((partner) => partner.name === "Hudson River Trading")
      .length,
    1,
  );
  assert.ok(highlighted.some((partner) => partner.name === "New partner"));
  assert.ok(!highlighted.some((partner) => partner.name === "OpenAI"));
  assert.ok(
    !highlighted.some((partner) => partner.name === "Legacy supporter"),
  );
  assert.deepEqual(getHighlightedPartners([]), []);
});
