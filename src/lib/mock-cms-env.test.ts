import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { getCmsNow } from "@/lib/mock-cms-env";

// `getMockCmsNow` (parsing MOCK_CMS_NOW) is covered in mock-cms.test.ts.

describe("getCmsNow", () => {
  const realNow = new Date("2031-05-04T10:00:00Z");
  const mockNow = "2026-10-01T12:00:00Z";

  beforeEach(() => {
    vi.useFakeTimers({ now: realNow });
    vi.stubEnv("USE_MOCK_CMS", "");
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("MOCK_CMS_NOW", mockNow);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  test("is MOCK_CMS_NOW under the mock CMS", () => {
    vi.stubEnv("USE_MOCK_CMS", "1");
    expect(getCmsNow().toISOString()).toBe("2026-10-01T12:00:00.000Z");
  });

  test("is the current time under the mock CMS without MOCK_CMS_NOW", () => {
    vi.stubEnv("USE_MOCK_CMS", "1");
    vi.stubEnv("MOCK_CMS_NOW", "");
    expect(getCmsNow()).toStrictEqual(realNow);
  });

  test.each([
    ["the mock CMS is off", {}],
    ["USE_MOCK_CMS is not exactly 1", { USE_MOCK_CMS: "true" }],
    ["on Vercel", { USE_MOCK_CMS: "1", VERCEL: "1" }],
  ])("is the current time when %s", (_, env: Record<string, string>) => {
    for (const [key, value] of Object.entries(env)) vi.stubEnv(key, value);
    expect(getCmsNow()).toStrictEqual(realNow);
  });

  test("rejects an invalid MOCK_CMS_NOW instead of using the real clock", () => {
    vi.stubEnv("USE_MOCK_CMS", "1");
    vi.stubEnv("MOCK_CMS_NOW", "tomorrow");
    expect(() => getCmsNow()).toThrow(/MOCK_CMS_NOW/);
  });
});
