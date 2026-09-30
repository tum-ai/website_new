import { afterEach, expect, test, vi } from "vitest";
import { contentTokenNames } from "@/lib/content-tokens";
import {
  contentTokens,
  contentTokensFor,
  getContentTokens,
} from "./content-tokens";
import { eLabApplicationCopy, eLabWindowFallback } from "./e-lab";
import { membershipConfig } from "./membership";
import { siteFactsFallback } from "./site-facts";

afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

test("every placeholder has a non-empty value without placeholders of its own", () => {
  expect(Object.keys(contentTokens).sort()).toStrictEqual(
    [...contentTokenNames].sort(),
  );
  for (const [name, value] of Object.entries(contentTokens)) {
    expect(value.trim(), name).not.toBe("");
    expect(value, name).not.toMatch(/\{\{/);
  }
});

test("values come from the config facts", () => {
  expect(contentTokens["eLab.deadline"]).toBe(
    eLabApplicationCopy.deadlineLabel,
  );
});

test.each(["code", "sanity"] as const)(
  "per render, the %s source yields the code values (parity over the backfill)",
  async (source) => {
    useSource(source);
    await expect(getContentTokens()).resolves.toStrictEqual(contentTokens);
  },
);

test("values follow the resolved facts and windows", () => {
  const tokens = contentTokensFor({
    facts: {
      ...siteFactsFallback,
      organization: {
        ...siteFactsFallback.organization,
        activeMembers: 1,
        alumni: 2,
      },
      contactEmails: {
        ...siteFactsFallback.contactEmails,
        recruitment: "join@example.com",
      },
    },
    membership: {
      ...membershipConfig,
      round: {
        ...membershipConfig.round,
        opens: "01.03.2027",
        deadlineDate: "31.03.2027",
      },
    },
    eLab: {
      ...eLabWindowFallback,
      applicationDeadlineDate: "01.08.2027",
      applicationDeadlineTime: "12:00",
    },
  });
  expect(tokens["org.officialMembers"]).toBe("3");
  expect(tokens["contact.recruitmentEmail"]).toBe("join@example.com");
  expect(tokens["recruiting.application"]).toBe("March 1st - March 31st");
  expect(tokens["eLab.deadline"]).toBe("01.08.2027 at 12:00 (Munich time)");
});
