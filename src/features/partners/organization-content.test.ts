import { existsSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";
import { publicDir } from "@/lib/cms-backfill";
import { readImageSize } from "@/lib/cms-content-mock";
import { getLogoLists } from "@/lib/organization-content";
import { organizations, partnerLogoLists } from "./data/organizations";
import { alumniDestinations, symbolOnlyLogos } from "./data/partner-logos";
import { marqueeLogos } from "./data/partner-marquee-logos";
import {
  buildOrganizationBackfill,
  getPartnerLogos,
} from "./organization-content";

/**
 * Parity for the organisation slice: the organisation documents and the
 * partner logo lists, read back through the real query under the mock CMS,
 * give exactly the code lists, down to each file's size and alt text.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const codeLogos = {
  alumniDestinations,
  marqueeLogos,
  symbolOnlyLogos,
};

describe("the organisation slice", () => {
  test("code source: the code logos", async () => {
    useSource("code");
    await expect(getPartnerLogos()).resolves.toStrictEqual(codeLogos);
  });

  test("sanity source over the backfill: the same organisations, sizes and alt text", async () => {
    useSource("sanity");
    await expect(
      getLogoLists({
        lists: partnerLogoLists,
        label: "parity",
        mockDocuments: buildOrganizationBackfill,
      }),
    ).resolves.toStrictEqual(partnerLogoLists);
    await expect(getPartnerLogos()).resolves.toStrictEqual(codeLogos);
  });

  test("one document per organisation, with a public id from its key", () => {
    const documents = buildOrganizationBackfill().filter(
      ({ _type }) => _type === "organization",
    );
    expect(documents).toHaveLength(organizations.length);
    expect(documents.map(({ _id }) => _id)).toContain(
      "organization-hudson-river-trading",
    );
  });
});

describe("the organisation table", () => {
  test("keys are unique kebab-case ids", () => {
    const keys = organizations.map(({ key }) => key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of keys) expect(key).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  test("every logo states its file's intrinsic size and has alt text", () => {
    for (const organization of organizations) {
      for (const artwork of [organization.logo, organization.logoOnDark]) {
        if (!artwork) continue;
        const file = join(publicDir, artwork.src);
        expect(existsSync(file), artwork.src).toBe(true);
        expect(
          { width: artwork.width, height: artwork.height },
          artwork.src,
        ).toStrictEqual(readImageSize(file));
        expect(artwork.alt, artwork.src).not.toBe("");
      }
    }
  });
});
