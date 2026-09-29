import { afterEach, describe, expect, test, vi } from "vitest";
import {
  rexInstitutionsOf,
  rexOrganizations,
  rexOwnOrganizations,
} from "./data/rex";
import { buildRexBackfill, getRexInstitutions } from "./rex-content";

const rexInstitutions = rexInstitutionsOf(rexOrganizations);

/**
 * Parity for the REX slice: the institutions, read back from the backfill
 * through the real query under the mock CMS, are exactly the code list.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

describe("the REX slice", () => {
  test("code source: the code institutions", async () => {
    useSource("code");
    await expect(getRexInstitutions()).resolves.toStrictEqual(rexInstitutions);
  });

  test("sanity source over the backfill: the same institutions", async () => {
    useSource("sanity");
    await expect(getRexInstitutions()).resolves.toStrictEqual(rexInstitutions);
  });

  test("the backfill holds each REX-only institution and one ordered list", () => {
    const documents = buildRexBackfill();
    expect(
      documents.filter(({ _type }) => _type === "organization"),
    ).toHaveLength(rexOwnOrganizations.length);
    expect(documents.filter(({ _type }) => _type === "logoList")).toHaveLength(
      1,
    );
  });

  test("an institution without a logo or short name is set by its name", () => {
    expect(
      rexInstitutionsOf([{ key: "eth", name: "ETH Zurich" }]),
    ).toStrictEqual([
      { key: "eth", name: "ETH Zurich", shortName: "ETH Zurich" },
    ]);
  });
});
