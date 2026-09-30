import { expect, test } from "vitest";
import { validateBookingUrl, validateFunnel } from "./site-settings";

test("each gate of the selection funnel is at most the one before", () => {
  const funnel = {
    applications: 400,
    admitted: 30,
    midterm: 24,
    selectionDay: 16,
    finalPitch: 10,
  };
  expect(validateFunnel(funnel)).toBe(true);
  expect(validateFunnel(undefined)).toBe(true);
  expect(validateFunnel({ ...funnel, midterm: 31 })).toBe(
    "Teams at the Midterm Pitch (31) can't be more than teams admitted (30).",
  );
});

test("the booking page must be a Cal page", () => {
  expect(validateBookingUrl("https://cal.eu/ada/intro")).toBe(true);
  expect(validateBookingUrl(undefined)).toBe(true);
  expect(validateBookingUrl("https://evil.example/ada/intro")).toMatch(
    /cal\.eu or cal\.com/,
  );
});
