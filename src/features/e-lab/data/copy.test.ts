import { expect, test } from "vitest";
import { teamCountTextOf } from "@/config/e-lab";
import { involveMailUrl } from "./copy";

test("a way in mails the Venture team with its title in the subject", () => {
  const url = new URL(involveMailUrl("venture@example.org", "Join the jury"));
  expect(url.protocol).toBe("mailto:");
  expect(url.pathname).toBe("venture@example.org");
  expect(url.searchParams.get("subject")).toBe("ELAB: Join the jury");
  expect(url.searchParams.get("body")).toBe("Hi ELAB team,\n\n");
});

test("a range of teams reads as one figure", () => {
  expect(teamCountTextOf(15, 20)).toBe("15–20");
  expect(teamCountTextOf(10)).toBe("10");
  expect(teamCountTextOf(10, 10)).toBe("10");
});
