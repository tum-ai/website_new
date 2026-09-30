import { existsSync } from "node:fs";
import { expect, test } from "vitest";
import { contactEmails, partnershipContact } from "@/config/contact";
import { partnerOrganizations } from "./data/organizations";
import { alumniDestinations } from "./data/partner-logos";
import { marqueeLogos } from "./data/partner-marquee-logos";
import {
  partnerCaseStudies,
  partnerPillarTemplates,
  partnerProfiles,
} from "./data/partners";
import {
  getHighlightedPartners,
  getPartnerDirectory,
  partnerOf,
} from "./partner-directory";
import { getPartnerKey } from "./partner-key";

/** The code's partner directory. */
const codeDirectory = () =>
  getPartnerDirectory(partnerOrganizations.map(partnerOf));

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
  expect(email.pathname).toBe(contactEmails.partners);
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
  const configured = new URL(partnershipContact.bookingUrl);
  expect(booking.origin).toBe(configured.origin);
  expect(booking.pathname).toBe(configured.pathname);
  expect(booking.searchParams.getAll("guest")).toStrictEqual([
    contactEmails.partners,
  ]);
  expect(booking.searchParams.get("notes") ?? "").toMatch(
    /Hackathon|hackathon/,
  );
  const defaultEmail = new URL(getPartnershipEmailUrl());
  expect(defaultEmail.pathname).toBe(contactEmails.partners);
  expect(defaultEmail.searchParams.get("cc")).toBe(
    partnershipContact.cc.join(","),
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

test("the code's highlighted partners are the eighteen launch partners in tier order", () => {
  const result = getHighlightedPartners(codeDirectory());
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
  for (const partner of getHighlightedPartners(codeDirectory())) {
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
    ...codeDirectory(),
    ...alumniDestinations,
    ...partnerProfiles,
    ...partnerPillarTemplates.map(({ image }) => ({ image: image.src })),
    ...partnerCaseStudies,
  ]) {
    expect(item.image, "Missing curated partner image").toBeTruthy();
    expect(
      existsSync(new URL(`../../../public${item.image}`, import.meta.url)),
      `Missing public asset: ${item.image}`,
    ).toBe(true);
  }
});

test("the directory sorts by tier, lead, launch order and name, and keeps one entry per company", () => {
  const result = getPartnerDirectory([
    { id: "zeta", name: "Zeta", tier: "gold" },
    { id: "hudson-river-trading", name: "Hudson River Trading", tier: "gold" },
    { id: "openai", name: "OpenAI", tier: "gold" },
    { id: "alpha", name: "Alpha", tier: "gold", featured: true },
    { id: "hrt", name: "HRT", tier: "supporter" },
    { id: "ibm", name: "IBM", category: "Research Partners" },
    { id: "unknown", name: "Unknown tier", tier: "platinum" as never },
    { id: "unsafe", name: "Unsafe", link: "javascript:alert(1)" },
    { id: "blank", name: " " },
  ]);
  expect(result.map(({ name, tier }) => [name, tier])).toStrictEqual([
    ["Alpha", "gold"],
    ["OpenAI", "gold"],
    ["Hudson River Trading", "gold"],
    ["Zeta", "gold"],
    ["IBM", "supporter"],
    ["Unknown tier", "supporter"],
    ["Unsafe", "supporter"],
  ]);
  expect(result.find((p) => p.name === "Unsafe")?.link).toBeUndefined();
});

test("a partner organisation lists its website, light logo and partnership", () => {
  expect(
    partnerOf({
      key: "mutagent",
      name: "Mutagent",
      href: "https://mutagent.io/",
      logo: {
        src: "/assets/partners/logos/mutagent.svg",
        width: 672,
        height: 672,
        alt: "Mutagent logo",
        symbolOnly: true,
      },
      partnership: {
        tier: "bronze",
        category: "Industry Partners",
        featured: true,
      },
    }),
  ).toStrictEqual({
    id: "mutagent",
    name: "Mutagent",
    link: "https://mutagent.io/",
    image: "/assets/partners/logos/mutagent.svg",
    category: "Industry Partners",
    tier: "bronze",
    featured: true,
    symbolOnly: true,
  });
  expect(partnerOf({ key: "meta", name: "Meta" })).toStrictEqual({
    id: "meta",
    name: "Meta",
    tier: "supporter",
  });
});

test("every production partner is a code partner organisation", () => {
  // Names of the old site's partner documents (2026-09-29), as its editors
  // typed them: each must find its organisation by key, as the migration does.
  const keys = new Set(
    partnerOrganizations.map(({ key }) => getPartnerKey(key)),
  );
  for (const name of [
    "10x Founders",
    "AWS",
    "Aleph Alpha",
    "Anthropic",
    "Applied AI",
    "BMW",
    "CDTM",
    "CoBrowser",
    "ETH Analytics Club",
    "EWOR",
    "Eleven Labs",
    "Enactus Munich",
    "EntrepreNow Community",
    "GDSC",
    "Google",
    "Harvard Medical School",
    "Heimkapital",
    "Helmholtz",
    "Hudson River Trading",
    "Hugging Face",
    "IBM",
    "Initiatives for Humanity",
    "Klinikum Rechts der Isar",
    "Knust CoE IC",
    "LMU",
    "Lovable",
    "MCML",
    "MI4People",
    "MIT",
    "Microsoft",
    "OpenAI",
    "Project-A",
    "QSummit",
    "Rohde-Schwarz",
    "Siemens",
    "Speedinvest",
    "Start Munich",
    "Tensordyne",
    "TumVentureLabs",
    "UVC Partners",
    "Unite",
    "UnternehmerTUM",
    "Vercel",
    "auswaertiges-amt",
    "bkw",
    "check24",
    "flowerlabs",
    "infineon",
    "itcs",
    "janestreet",
    "ministry_for_digital_affairs",
    "n8n",
    "netlight",
    "nvidia",
  ]) {
    expect(keys, name).toContain(getPartnerKey(name));
  }
});

test("email CCs reach the configured partnership contacts with and without finder context", () => {
  for (const selection of [
    initialFunnelState,
    { intent: "hackathon", duration: "ongoing" } as const,
  ]) {
    const email = new URL(getPartnershipEmailUrl(selection));
    expect(email.pathname).toBe(contactEmails.partners);
    expect(email.searchParams.get("cc")).toBe(partnershipContact.cc.join(","));
    expect(email.searchParams.getAll("cc").length).toBe(1);
    expect(email.searchParams.get("subject") ?? "").toMatch(
      /^Partnership request/,
    );
    expect(email.searchParams.get("body") ?? "").toMatch(/^Hi TUM.ai team,/);
  }
});

test("the marquee shows every highlighted partner and follows the tiers", () => {
  expect(getHighlightedPartners(codeDirectory())).toHaveLength(18);
  const highlighted = getHighlightedPartners(
    getPartnerDirectory([
      { id: "openai", name: "OpenAI", tier: "supporter" },
      { id: "new", name: "New partner", tier: "bronze" },
      { id: "legacy", name: "Legacy supporter", featured: true },
    ]),
  );
  expect(highlighted.map(({ name }) => name)).toStrictEqual(["New partner"]);
  expect(getHighlightedPartners([])).toStrictEqual([]);
});
