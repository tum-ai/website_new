import { expect, test } from "vitest";
import { getPartnerDirectory, partnerOf } from "./partner-directory";
import {
  testPartnershipContact as contact,
  partnershipFinderCopy as copy,
} from "./partnership.test-fixtures";
import {
  getPartnershipBookingUrl,
  getPartnershipEmailUrl,
  getPartnershipRecommendation,
  initialFunnelState,
  partnershipFunnelReducer,
} from "./partnerships";

test("all paths use the supplied CMS recommendation", () => {
  for (const intent of ["talent", "hackathon", "brand", "research"] as const) {
    expect(
      getPartnershipRecommendation({ intent, duration: "one-off" }, copy),
    ).toBe(copy.recommendations[intent]);
    expect(
      getPartnershipRecommendation({ intent, duration: "ongoing" }, copy),
    ).toBe(
      copy.recommendations[intent === "research" ? "research" : "longTerm"],
    );
  }
  expect(
    getPartnershipRecommendation({ intent: null, duration: null }, copy),
  ).toBeNull();
});
test("changing intent and navigating back clears stale results", () => {
  const selected = partnershipFunnelReducer(initialFunnelState, {
    type: "intent",
    intent: "talent",
  });
  const result = partnershipFunnelReducer(selected, {
    type: "duration",
    duration: "ongoing",
  });
  expect(result.step).toBe("result");
  expect(partnershipFunnelReducer(result, { type: "back" })).toEqual({
    ...selected,
    duration: null,
  });
  expect(
    partnershipFunnelReducer(result, { type: "intent", intent: "research" }),
  ).toEqual({ step: "duration", intent: "research", duration: null });
  expect(partnershipFunnelReducer(result, { type: "reset" })).toEqual(
    initialFunnelState,
  );
});
test("email and booking encode render-provided words and contact facts", () => {
  const selection = { intent: "hackathon", duration: "ongoing" } as const;
  const email = new URL(getPartnershipEmailUrl(selection, copy, contact));
  expect(email.pathname).toBe(contact.email);
  expect(email.searchParams.get("subject")).toBe(
    `Partnership request: ${copy.intents[1]?.shortLabel}`,
  );
  expect(email.searchParams.get("body")).toContain(
    copy.recommendations.longTerm.name,
  );
  const booking = new URL(getPartnershipBookingUrl(selection, copy, contact));
  expect(booking.searchParams.get("guest")).toBe(contact.email);
  expect(booking.searchParams.get("notes")).toContain(copy.durations[1]?.label);
});
test("directory sorts tier, featured, optional editorial order and alphabetic names", () => {
  const partners = [
    { id: "z", name: "Zulu", tier: "silver" as const },
    { id: "b", name: "Beta", tier: "gold" as const },
    { id: "a", name: "Alpha", tier: "gold" as const },
    { id: "o", name: "Ordered", tier: "gold" as const, order: 10 },
    { id: "f", name: "Featured", tier: "gold" as const, featured: true },
  ];
  expect(getPartnerDirectory(partners).map((p) => p.id)).toEqual([
    "f",
    "o",
    "a",
    "b",
    "z",
  ]);
  expect(
    partnerOf({
      key: "a",
      name: "Alpha",
      partnership: { tier: "gold", order: 5 },
    }).order,
  ).toBe(5);
});
test("directory removes duplicates and unsafe links", () => {
  expect(
    getPartnerDirectory([
      { id: "one", name: "Example", tier: "gold", link: "javascript:alert(1)" },
      { id: "two", name: "Example", tier: "silver" },
    ]),
  ).toMatchObject([{ id: "one", link: undefined }]);
});
