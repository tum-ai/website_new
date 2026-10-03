import { expect, test } from "vitest";
import {
  validateCampaignEnd,
  validateHeaderCtaVariant,
  validateNotifyUrl,
} from "./campaign";

test("a campaign ends after it starts", () => {
  const document = { startDate: "2026-10-01" };
  expect(validateCampaignEnd(undefined, { document })).toBe(true);
  expect(validateCampaignEnd("2026-10-02", { document })).toBe(true);
  expect(validateCampaignEnd("2026-09-30", { document })).toMatch(
    /on or after its first day/,
  );
  // One day: without times it runs the whole day; with them, end after start.
  expect(validateCampaignEnd("2026-10-01", { document })).toBe(true);
  expect(
    validateCampaignEnd("2026-10-01", {
      document: { ...document, startTime: "18:00", endTime: "09:00" },
    }),
  ).toMatch(/end time must be after the start time/);
});

test("Get Notified needs a signup link", () => {
  expect(
    validateNotifyUrl(undefined, { parent: { variant: "notify" } }),
  ).toMatch(/signup link/);
  expect(
    validateNotifyUrl("https://example.com", { parent: { variant: "notify" } }),
  ).toBe(true);
  expect(validateNotifyUrl(undefined, { parent: { variant: "partner" } })).toBe(
    true,
  );
});

test("the header button stays optional until it has a label or a link", () => {
  expect(validateHeaderCtaVariant(undefined, { parent: undefined })).toBe(true);
  expect(
    validateHeaderCtaVariant(undefined, {
      parent: { yieldsToRecruiting: false },
    }),
  ).toBe(true);
  expect(
    validateHeaderCtaVariant(undefined, { parent: { label: "Join" } }),
  ).toMatch(/Choose which button/);
  expect(validateHeaderCtaVariant("elab", { parent: { label: "Join" } })).toBe(
    true,
  );
});
