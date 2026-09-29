import { afterEach, describe, expect, test, vi } from "vitest";
import { fetchContent } from "@/lib/cms-content";
import { mergeOverFallback } from "@/lib/cms-content-model";
import type { SITE_SETTINGS_QUERY_RESULT } from "@/lib/sanity.types.generated";
import { siteFactsFallback } from "./site-facts";
import {
  buildSiteSettingsBackfill,
  getSiteFacts,
  SITE_SETTINGS_QUERY,
  selectSiteFacts,
} from "./site-settings-content";

/**
 * Parity: the backfilled `siteSettings` document, read back through the
 * real GROQ query under the mock CMS, yields exactly the code facts. If this
 * fails, the query, `selectSiteFacts` or the builder lost or changed a fact
 * on the way to the CMS.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

function useSource(source: "code" | "sanity") {
  vi.stubEnv("CMS_CONTENT_SOURCE", source);
  vi.stubEnv("USE_MOCK_CMS", "1");
  vi.stubEnv("VERCEL", "");
}

const readBack = () =>
  fetchContent<SITE_SETTINGS_QUERY_RESULT>({
    query: SITE_SETTINGS_QUERY,
    tags: [],
    mockDocuments: buildSiteSettingsBackfill,
    label: "parity",
  });

describe("the site settings slice", () => {
  test("code source: the config facts", async () => {
    useSource("code");
    await expect(getSiteFacts()).resolves.toStrictEqual(siteFactsFallback);
  });

  test("the mock serves the backfill through the real query", async () => {
    useSource("sanity");
    const result = await readBack();
    expect(result?.organization.activeMembers).toBe(
      siteFactsFallback.organization.activeMembers,
    );
    // The logo went through the asset pipeline (intrinsic size from the file).
    expect(result?.eLab.heroLogo).toMatchObject({
      src: siteFactsFallback.eLab.heroLogo.src,
      width: siteFactsFallback.eLab.heroLogo.width,
      height: siteFactsFallback.eLab.heroLogo.height,
    });
  });

  test("sanity source over the backfill: the same facts", async () => {
    useSource("sanity");
    await expect(getSiteFacts()).resolves.toStrictEqual(siteFactsFallback);
  });

  test("the backfill is the one singleton, with its type as id", () => {
    expect(
      buildSiteSettingsBackfill().map(({ _id, _type }) => [_id, _type]),
    ).toStrictEqual([["siteSettings", "siteSettings"]]);
  });
});

describe("CMS values over the code facts", () => {
  const edited = async (
    edit: (result: NonNullable<SITE_SETTINGS_QUERY_RESULT>) => void,
  ) => {
    useSource("sanity");
    const result = await readBack();
    if (!result) throw new Error("expected the backfill");
    edit(result);
    return mergeOverFallback(siteFactsFallback, selectSiteFacts(result));
  };

  test("an edited fact shows", async () => {
    const facts = await edited((result) => {
      result.organization.activeMembers = 999;
      result.impact.publicationVenues = ["A", "B"];
      result.headerCtaFallback = "elab";
    });
    expect(facts.organization.activeMembers).toBe(999);
    expect(facts.impact.publicationVenues).toStrictEqual(["A", "B"]);
    expect(facts.headerCtaFallback).toBe("elab");
  });

  test("unusable values keep the code value", async () => {
    const facts = await edited((result) => {
      result.contactEmails.general = "not an address";
      result.socialLinks.linkedin = "http://insecure.example.com";
      result.eLab.currentIteration = "six";
      result.eLab.selection.finalPitch = result.eLab.selection.applications + 1;
      result.headerCtaFallback = "notify" as "partner";
    });
    expect(facts.contactEmails.general).toBe(
      siteFactsFallback.contactEmails.general,
    );
    expect(facts.socialLinks.linkedin).toBe(
      siteFactsFallback.socialLinks.linkedin,
    );
    expect(facts.eLab.currentIteration).toBe(
      siteFactsFallback.eLab.currentIteration,
    );
    expect(facts.eLab.selection).toStrictEqual(
      siteFactsFallback.eLab.selection,
    );
    expect(facts.headerCtaFallback).toBe(siteFactsFallback.headerCtaFallback);
  });

  test("no document: the code facts", async () => {
    expect(mergeOverFallback(siteFactsFallback, selectSiteFacts(null))).toBe(
      siteFactsFallback,
    );
  });
});
