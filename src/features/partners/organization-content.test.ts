import { beforeEach, expect, test, vi } from "vitest";
import { getPartnerLogos, getPartners } from "./organization-content";

vi.mock("@/lib/organization-content", () => ({
  getPartnerOrganizations: vi.fn(),
  getLogoLists: vi.fn(),
}));

import {
  getLogoLists,
  getPartnerOrganizations,
} from "@/lib/organization-content";

beforeEach(() => vi.resetAllMocks());
test("partners preserve CMS order via pure directory ranking", async () => {
  vi.mocked(getPartnerOrganizations).mockResolvedValue([
    { key: "z", name: "Zulu", partnership: { tier: "gold" } },
    { key: "a", name: "Alpha", partnership: { tier: "gold", order: 10 } },
  ]);
  expect((await getPartners()).map((p) => p.id)).toEqual(["a", "z"]);
});
test("cleared optional logo collections stay empty", async () => {
  vi.mocked(getLogoLists).mockResolvedValue({
    "alumni-destinations": [],
    "partner-marquee": [],
    "ehl-partners": [],
    "e-lab-ventures": [],
    "rex-institutions": [],
  });
  expect(await getPartnerLogos()).toEqual({
    alumniDestinations: [],
    marqueeLogos: {},
    symbolOnlyLogos: new Set(),
  });
});
